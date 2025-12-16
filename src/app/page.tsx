import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginPage from "./auth/login/page";


interface JWTPayload {
data: {
  id: string;
  role: 'admin' | 'actionnaire';
};
iat: number;
exp: number;
}

function decodeJWT(token: string): JWTPayload | null {
try {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = parts[1];
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  return decoded;
} catch (error) {
  console.error('Erreur de décodage JWT:', error);
  return null;
}
}
export default async function Home() {
  const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (token) {
      const decoded = decodeJWT(token.value);
      if (decoded && decoded.data && decoded.data.role) {
        if (decoded.data.role === 'admin') {
          redirect("/dashboard/admin/actionnaire");
        } else if (decoded.data.role === 'actionnaire') {
          redirect("/dashboard/actionnaire");
        }
      } else {
       
       
      }
    }
  return (
 <LoginPage/>
  );
}
