import ownerRegistered from "@/actions/owner-registered";
import PageGuestLogin from "./page_guest_login";
import PageGuestRegister from "./page_guest_register";

export default async function HomePageGuest() {
  const appHasOwner = await ownerRegistered();
  if (appHasOwner) {
    return <PageGuestLogin />;
  }
  if (appHasOwner === null) {
    return <span>Please try again later</span>;
  }
  return <PageGuestRegister />;
}
