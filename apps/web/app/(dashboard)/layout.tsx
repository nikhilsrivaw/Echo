
import { DashboardLayout } from "@/modules/dashbaord/ui/layouts/dashbaord-layout";

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}

export default Layout;