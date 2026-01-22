import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'

type AuthMode = 'login' | 'signup'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Enter your credentials to access your meal planner'
              : 'Enter your details to get started with meal planning'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <LoginForm onSwitchToSignUp={() => setMode('signup')} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setMode('login')} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
