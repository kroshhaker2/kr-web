import { Router, Route } from "@solidjs/router";

import Gallery from "@/pages/Gallery";

import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Moderation from "@/pages/admin/Moderation";
import Tags from "@/pages/admin/Tags";
import Users from "@/pages/admin/Users";
import Settings from "@/pages/admin/Settings";

export default function App() {
    return (
        <Router>
            <Route path="/" component={Gallery} />

            <Route path="/admin" component={AdminLayout}>
                <Route path="/" component={Dashboard} />
                <Route path="/tags" component={Tags} />
                <Route path="/users" component={Users} />
                <Route path="/settings" component={Settings} />
            </Route>
            <Route path="admin/mod" component={Moderation} />
        </Router>
    );
}
