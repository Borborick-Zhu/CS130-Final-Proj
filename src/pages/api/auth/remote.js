import dotenv from 'dotenv';

dotenv.config({ path: '../../../.env.local'});

const { default: supabase } = await import('../../../lib/supabaseClient.mjs');

// Sign up user
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error('Sign-up error:', error.message);
    } else {
      console.log('User signed up:', data);
    }
}
  
// Sign In User
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Sign-in error:', error.message);
    } else {
        console.log('User signed in:', data);
    }
}
  
// Sign Out User
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Sign-out error:', error.message);
    } else {
        console.log('User signed out successfully');
    }
}
  
// Get Current User
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    return user;
}

  
  
  

  

