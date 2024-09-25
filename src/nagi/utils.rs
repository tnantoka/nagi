use super::{notes::Note, settings::Settings};
use muda::{Menu, PredefinedMenuItem, Submenu};
use tao::window::Window;
use wry::{WebView, WebViewBuilder};

pub fn init_menu() {
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
}

#[cfg(debug_assertions)]
pub fn web_view_builder(window: &Window) -> WebViewBuilder {
    WebViewBuilder::new(window).with_url("http://localhost:5173")
}

#[cfg(not(debug_assertions))]
pub fn web_view_builder(window: &Window) -> WebViewBuilder {
    const INDEX_HTML: &str = include_str!("./front/dist/index.html");
    WebViewBuilder::new(window).with_html(INDEX_HTML)
}

pub fn set_settings_to_js(webview: &WebView, settings: &Settings) {
    match serde_json::to_string(settings) {
        Ok(json) => {
            let _ = webview.evaluate_script(&format!("setSettings({})", json));
        }
        Err(e) => eprintln!("Failed to serialize settings: {}", e),
    }
}

pub fn set_notes_to_js(webview: &WebView) {
    let runtime = tokio::runtime::Runtime::new().unwrap();
    let notes = runtime.block_on(async { Note::select_all().await });
    match serde_json::to_string(&notes) {
        Ok(json) => {
            let _ = webview.evaluate_script(&format!("setNotes({})", json));
        }
        Err(e) => eprintln!("Failed to serialize notes: {}", e),
    }
}
