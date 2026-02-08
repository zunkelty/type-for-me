use tauri::{TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("")
                .inner_size(800.0, 600.0)
                .resizable(false);

            // use overlay title bar on macOS so web content can provide its own top bar
            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Overlay);

            let window = win_builder.build().unwrap();

            // set background color only when building for macOS
            #[cfg(target_os = "macos")]
            {
                use objc2_app_kit::{NSColor, NSWindow};

                let ns_window: *mut std::ffi::c_void = window.ns_window().unwrap();

                unsafe {
                    let ns_window: &NSWindow = &*ns_window.cast();
                    let bg_color = NSColor::colorWithDeviceRed_green_blue_alpha(
                        250.0 / 255.0,
                        250.0 / 255.0,
                        249.0 / 255.0,
                        1.0,
                    );
                    ns_window.setBackgroundColor(Some(&bg_color));
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
