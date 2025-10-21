import { useState } from 'react'
import { authService } from '../services/auth'

interface AuthProps {
  onLogin: () => void
}

function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login form state
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [registerUsername, setRegisterUsername] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login({ username: loginUsername, password: loginPassword })
      authService.setAuthToken(response.access_token)
      onLogin()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.register({
        username: registerUsername,
        email: registerEmail || undefined,
        password: registerPassword
      })
      authService.setAuthToken(response.access_token)
      onLogin()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">overhang</h2>
            <p className="mt-2 text-sm text-gray-600">
              climbing progress tracker
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              sign in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              sign up
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="bg-white py-8 px-6 shadow-md rounded-lg space-y-4">
            <h3 className="text-xl font-semibold text-center text-gray-900">
              {isLogin ? 'sign in' : 'create account'}
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Username field (both login and register) */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                username
              </label>
              <input
                id="username"
                type="text"
                value={isLogin ? loginUsername : registerUsername}
                onChange={(e) => isLogin ? setLoginUsername(e.target.value) : setRegisterUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>

            {/* Email field (register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  email <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            )}

            {/* Password field (both login and register) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                password
              </label>
              <input
                id="password"
                type="password"
                value={isLogin ? loginPassword : registerPassword}
                onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                required
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isLogin ? 'signing in...' : 'creating account...') : (isLogin ? 'sign in' : 'create account')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Auth