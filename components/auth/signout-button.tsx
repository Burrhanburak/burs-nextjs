import { signOutAction } from "@/lib/auth-actions"
 
export function SignOut() {
  return (
    <form action={signOutAction}>
      <button type="submit">Sign Out</button>
    </form>
  )
}