require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'SUPABASE_URL';
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// register account
document.getElementById('registerForm').addEventListener('submit', async (event) => {
    console.log("hehe");
    event.preventDefault();

    const formData = {
        country: document.getElementById('country').value,
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };

    try {
        const result = await handleRegistration(formData);
        if (result.success) {
            alert('Registration successful!');
        }
    } catch (error) {
        console.error(error);
        alert('Registration failed.');
    }
});

async function handleRegistration(formData) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password
        });

        if (authError) throw authError;

        const { error: userInsertError } = await supabase
            .from('Users')
            .insert([
                {
                    id: authData.user.id, // ID from Supabase Auth
                    username: formData.username,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password, // It's better to store hashed passwords!
                    country: formData.country,
                    createdAt: new Date().toISOString(), // Current timestamp
                    modifiedAt: new Date().toISOString() // Set initially to createdAt
                }
            ]);

        if (userInsertError) throw userInsertError;

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Error during registration');
    }
}

async function handleLogin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Store the session token
        localStorage.setItem('session', JSON.stringify(data.session));

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error(error.message || 'Error during login');
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Clear local storage
        localStorage.removeItem('session');
        
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.message || 'Error during logout');
    }
}

async function handlePasswordReset(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`,
        });

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        throw new Error(error.message || 'Error requesting password reset');
    }
}

// Function to check if user is authenticated
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        return { 
            isAuthenticated: !!session,
            session 
        };
    } catch (error) {
        console.error('Auth check error:', error);
        return { 
            isAuthenticated: false,
            error: error.message 
        };
    }
}

// Function to get user profile data
async function getUserProfile() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        return profile;
    } catch (error) {
        console.error('Get profile error:', error);
        throw new Error(error.message || 'Error fetching user profile');
    }
}