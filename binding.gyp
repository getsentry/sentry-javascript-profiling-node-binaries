{
    "targets": [
        {
            "target_name": "sentry_cpu_profiler",
            "sources": ["bindings/cpu_profiler.cc"],
            # Silence gcc8 deprecation warning https://github.com/nodejs/nan/issues/807#issuecomment-455750192
            "cflags": ["-Wno-cast-function-type"],
            "msvs_settings": {"VCCLCompilerTool": {"LanguageStandard": "stdcpp20"}},
            "xcode_settings": {"CLANG_CXX_LANGUAGE_STANDARD": "c++20"},
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "conditions": [['OS!="win"', {"cflags_cc": ["-std=c++20"]}]],
        },
    ],
    "conditions": [
        [
            'OS=="win"',
            {
                "defines": [
                    # Stop <windows.h> from defining macros that conflict with
                    # std::min() and std::max().  We don't use <windows.h> (much)
                    # but we still inherit it from uv.h.
                    "NOMINMAX",
                ]
            },
        ],
    ],
}
