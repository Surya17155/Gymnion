import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'
import { getRoleForUser } from '@/lib/role'

export const Route = createFileRoute('/api/public/auth-check')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // This is a public endpoint to check if the client *can* reach the DB 
        // and potentially verify a token if passed
        const authHeader = request.headers.get('Authorization')
        
        if (!authHeader) {
          return new Response(JSON.stringify({ 
            status: 'ok', 
            message: 'Auth endpoint reachable',
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        try {
          const token = authHeader.replace('Bearer ', '')
          const { data: { user }, error } = await supabase.auth.getUser(token)
          
          if (error || !user) {
            return new Response(JSON.stringify({ 
              status: 'error', 
              error: error?.message || 'Invalid session',
              code: 'SESSION_INVALID'
            }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            })
          }

          const role = await getRoleForUser(user.id)
          
          return new Response(JSON.stringify({ 
            status: 'authenticated', 
            user_id: user.id,
            role: role,
            email: user.email
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err: any) {
          return new Response(JSON.stringify({ 
            status: 'error', 
            error: err.message 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }
      }
    }
  }
})
