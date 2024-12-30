import { HomeView } from 'src/sections/home/view';
import { redirect } from 'next/navigation';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Allurance',
};

export default function HomePage() {

  redirect('/auth/jwt/login/'); 
  return null;
//  return <HomeView />;
}
