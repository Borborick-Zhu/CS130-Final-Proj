// testSupabase.mjs
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' }); // Load environment variables from frontend/.env.local

console.log('Starting test script...');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Use dynamic import so that dotenv config is processed before initializing the Supabase client.
const { default: supabase } = await import('./lib/supabaseClient.mjs');

async function testInsertAndQuery() {
  // Prepare a new user object.
  const newUser = {
    email: 'testuser@example.com',
    password_hash: 'hashedpassword123', // In production, use a proper hash
    username: 'testuser'
  };

  console.log('\nInserting new user into the Users table...');
  // Insert the new user into the Users table.
  const { data: insertedUser, error: insertError, status, statusText } = await supabase
    .from('Users')
    .insert(newUser)
    .single();

  console.log('Insert operation status:', status, statusText);
  if (insertError) {
    console.error('Error inserting user:', insertError);
  } else {
    console.log('Inserted user:', insertedUser);
  }

  console.log('\nQuerying the Users table for the inserted user...');
  // Query the Users table filtering by the email.
  const { data: queriedUser, error: queryError, status: queryStatus, statusText: queryStatusText } = await supabase
    .from('Users')
    .select('id, email, username, created_at')
    .eq('email', newUser.email)
    .single();

  console.log('Query operation status:', queryStatus, queryStatusText);
  if (queryError) {
    console.error('Error querying user:', queryError);
  } else {
    console.log('Queried user:', queriedUser);
  }
}

// Run the test function and catch any unexpected errors.
testInsertAndQuery().catch(err => {
  console.error('Unexpected error during test execution:', err);
});
