import { auth } from "@/auth";
import HomePageGuest from "./page_guest";
import HomePagePrivate from "./page_private";

export default async function HomePage() {
  const sess = await auth();

  if(sess){
    return <HomePagePrivate />
  }

  return <HomePageGuest />
}
