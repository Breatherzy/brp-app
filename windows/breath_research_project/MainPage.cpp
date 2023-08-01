#include "pch.h"
#include "MainPage.h"
#if __has_include("MainPage.g.cpp")
#include "MainPage.g.cpp"
#endif

#include "App.h"

using namespace winrt;
using namespace xaml;

namespace winrt::breath_research_project::implementation
{
    MainPage::MainPage()
    {
        InitializeComponent();
        auto app = Application::Current().as<App>();
        ReactRootView().ReactNativeHost(app->Host());
    }
}
