import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RiErrorWarningLine } from "@remixicon/react"

export const metadata: Metadata = {
  title: "Authentication Error",
  description: "There was an error during authentication",
}

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  // Handle different error types
  const error = searchParams?.error || "Unknown error"
  
  let errorMessage = "An unknown error occurred during authentication."
  let errorTitle = "Authentication Error"
  
  switch (error) {
    case "CredentialsSignin":
      errorTitle = "Invalid Credentials"
      errorMessage = "The email or password you entered is incorrect."
      break
    case "OAuthSignin":
      errorMessage = "Error occurred while signing in with a provider."
      break
    case "OAuthCallback":
      errorMessage = "Error occurred while processing the authentication callback."
      break
    case "OAuthAccountNotLinked":
      errorMessage = "This email is already associated with another account."
      break
    case "EmailCreateAccount":
      errorMessage = "Error occurred while creating your account."
      break
    case "EmailSignin":
      errorMessage = "Error occurred while sending the login email."
      break
    case "AccessDenied":
      errorTitle = "Access Denied"
      errorMessage = "You do not have permission to access this resource."
      break
    case "Configuration":
      errorMessage = "There is an issue with the server configuration."
      break
    case "Verification":
      errorMessage = "The verification token has expired or has already been used."
      break
    default:
      errorMessage = "An unexpected error occurred during authentication."
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Authentication Error
            </h1>
            <p className="text-sm text-muted-foreground">
              We encountered a problem with your authentication
            </p>
          </div>
          
          <Alert variant="destructive" className="my-4">
            <RiErrorWarningLine className="h-4 w-4" />
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          
          <div className="flex flex-col space-y-4">
            <Button asChild>
              <Link href="/auth/login">
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline">
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-primary"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 