mod nagi;

use muda::{Menu, PredefinedMenuItem, Submenu};
use nagi::{dir::Dir, notes::Note, settings::Settings};
use tao::{
    dpi::{PhysicalPosition, PhysicalSize},
    event::{Event, StartCause, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder},
    window::{Window, WindowBuilder},
};
use wry::{http::Request, WebViewBuilder};

enum UserEvent {
    Init,
    UpsertNote(Note),
    DeleteNote(String),
}

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

    let webview = web_view_builder(&window)
        .with_ipc_handler(handler)
        .build()?;

    let menu_bar = Menu::new();

    let app_m = Submenu::new("App", true);
    app_m
        .append_items(&[&PredefinedMenuItem::quit(None)])
        .unwrap();

    let edit_m = Submenu::new("&Edit", true);
    menu_bar.append_items(&[&app_m, &edit_m]).unwrap();

    let undo_i = PredefinedMenuItem::undo(None);
    let redo_i = PredefinedMenuItem::redo(None);
    let copy_i = PredefinedMenuItem::copy(None);
    let cut_i = PredefinedMenuItem::cut(None);
    let paste_i = PredefinedMenuItem::paste(None);

    edit_m
        .append_items(&[
            &undo_i,
            &redo_i,
            &PredefinedMenuItem::separator(),
            &cut_i,
            &copy_i,
            &paste_i,
        ])
        .unwrap();

    menu_bar.init_for_nsapp();

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
                    set_settings(&webview, &settings);
                    set_notes(&webview);
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

#[cfg(debug_assertions)]
fn web_view_builder(window: &Window) -> WebViewBuilder {
    WebViewBuilder::new(window).with_url("http://localhost:5173")
}

#[cfg(not(debug_assertions))]
fn web_view_builder(window: &Window) -> WebViewBuilder {
    const INDEX_HTML: &str = include_str!("./front/dist/index.html");
    WebViewBuilder::new(window).with_html(INDEX_HTML)
}

fn set_settings(webview: &wry::WebView, settings: &Settings) {
    match serde_json::to_string(settings) {
        Ok(json) => {
            let _ = webview.evaluate_script(&format!("setSettings({})", json));
        }
        Err(e) => eprintln!("Failed to serialize settings: {}", e),
    }
}

fn set_notes(webview: &wry::WebView) {
    let runtime = tokio::runtime::Runtime::new().unwrap();
    let notes = runtime.block_on(async { Note::select_all().await });
    match serde_json::to_string(&notes) {
        Ok(json) => {
            let _ = webview.evaluate_script(&format!("setNotes({})", json));
        }
        Err(e) => eprintln!("Failed to serialize notes: {}", e),
    }
}
