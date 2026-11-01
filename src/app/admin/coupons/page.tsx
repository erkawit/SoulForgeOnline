// The separate coupon / partner back-office page (same admin login as /admin).
import AdminConsole from '@/components/admin/AdminConsole';
export const metadata = { title: 'SoulForge Coupons', robots: { index: false, follow: false } };
export default function Page() { return <AdminConsole initialTab="coupons" />; }
