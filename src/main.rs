mod nagi;

use nagi::{dir::Dir, events::UserEvent, notes::Note, settings::Settings, utils};
use tao::{
    dpi::{PhysicalPosition, PhysicalSize},
    event::{Event, StartCause, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder},
    window::WindowBuilder,
};
use wry::http::Request;

fn main() -> wry::Result<()> {
    Dir::init();

    let mut settings = Settings::load();

    let runtime = tokio::runtime::Runtime::new().unwrap();
    runtime.block_on(async {
        Note::init().await;
    });

    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let window = WindowBuilder::new()
        .with_title("Nagi")
        .with_inner_size(PhysicalSize::new(
            settings.window_size.0,
            settings.window_size.1,
        ))
        .with_position(PhysicalPosition::new(
            settings.window_position.0,
            settings.window_position.1,
        ))
        .build(&event_loop)
        .unwrap();

    let proxy = event_loop.create_proxy();
    let handler = move |req: Request<String>| {
        let body = req.body();
        match body.as_str() {
            _ if body.starts_with("init:") => {
                let _ = proxy.send_event(UserEvent::Init);
            }
            _ if body.starts_with("upsertNote:") => {
                match serde_json::from_str::<Note>(&body.replace("upsertNote:", "")) {
                    Ok(note) => {
                        let _ = proxy.send_event(UserEvent::UpsertNote(note));
                    }
                    Err(e) => eprintln!("Failed to parse note: {}", e),
                }
            }
            _ if body.starts_with("deleteNote:") => {
                let id = body.replace("deleteNote:", "");
                let _ = proxy.send_event(UserEvent::DeleteNote(id));
            }
            _ => {}
        }
    };

    let webview = utils::web_view_builder(&window)
        .with_ipc_handler(handler)
        .build()?;

    utils::init_menu();

    event_loop.run(move |event: Event<'_, UserEvent>, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::NewEvents(StartCause::Init) => {}
            Event::WindowEvent { event, .. } => match event {
                WindowEvent::CloseRequested => {
                    *control_flow = ControlFlow::Exit;
                }
                WindowEvent::Moved(size) => {
                    settings.window_position = (size.x, size.y);
                    settings.save().ok();
                }
                WindowEvent::Resized(size) => {
                    settings.window_size = (size.width, size.height);
                    settings.save().ok();
                }
                _ => {}
            },
            Event::UserEvent(e) => match e {
                UserEvent::Init => {
                    utils::set_settings_to_js(&webview, &settings);
                    utils::set_notes_to_js(&webview);
                }
                UserEvent::UpsertNote(note) => {
                    runtime.block_on(async {
                        Note::upsert(&note.id, &note.content, note.trashed).await;
                    });
                }
                UserEvent::DeleteNote(id) => {
                    runtime.block_on(async {
                        Note::delete(&id).await;
                    });
                }
            },
            _ => (),
        }
    });
}
