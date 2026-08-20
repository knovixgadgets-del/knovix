import { Navigate } from 'react-router-dom'

// Signup and login now share one phone + OTP flow — verifying an OTP for a
// number we haven't seen before creates the account automatically, so
// there's no separate signup form anymore.
export default function Signup() {
  return <Navigate to="/login" replace />
}
