import { onMount } from "solid-js";
import { Router, Route } from "@solidjs/router";

import { loadUser } from "@/stores/auth";
import { initTheme } from "./stores/theme";

import Gallery from "@/pages/Gallery";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Upload from "@/pages/Upload";

import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Tags from "@/pages/admin/Tags";
import Users from "@/pages/admin/Users";
import Settings from "@/pages/admin/Settings";
import Moderation from "@/pages/admin/Moderation";

function App() {
    onMount(() => {
        initTheme();
        void loadUser();
    });

    return (
        <Router>
            <Route path="/" component={Gallery} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/upload" component={Upload} />

            <Route path="/admin" component={AdminLayout}>
                <Route path="/" component={Dashboard} />
                <Route path="/tags" component={Tags} />
                <Route path="/users" component={Users} />
                <Route path="/settings" component={Settings} />
                <Route path="/mod" component={Moderation} />
            </Route>
        </Router>
    );
}

export default App;
