import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useLocation,
} from "@tanstack/react-router";
import BottomNav from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AccountsPage from "./pages/AccountsPage";
import AddBankPage from "./pages/AddBankPage";
import CommissionPage from "./pages/CommissionPage";
import DashboardPage from "./pages/DashboardPage";
import DepositPage from "./pages/DepositPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import SupportPage from "./pages/SupportPage";
import WithdrawPage from "./pages/WithdrawPage";

const PROTECTED_PATHS = [
  "/",
  "/deposit",
  "/withdraw",
  "/add-bank",
  "/commission",
  "/history",
  "/support",
  "/accounts",
  "/profile",
];

function RootLayout() {
  const { identity } = useInternetIdentity();
  const location = useLocation();
  const isProtected = PROTECTED_PATHS.some((p) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p),
  );

  return (
    <div className="bg-background min-h-dvh">
      <div className="mobile-container">
        <Outlet />
        {!!identity && isProtected && <BottomNav />}
      </div>
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});
const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});
const depositRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/deposit",
  component: DepositPage,
});
const withdrawRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/withdraw",
  component: WithdrawPage,
});
const addBankRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-bank",
  component: AddBankPage,
});
const commissionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/commission",
  component: CommissionPage,
});
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});
const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/support",
  component: SupportPage,
});
const accountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/accounts",
  component: AccountsPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  dashboardRoute,
  depositRoute,
  withdrawRoute,
  addBankRoute,
  commissionRoute,
  historyRoute,
  supportRoute,
  accountsRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
