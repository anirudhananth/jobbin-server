const express = require("express");
const app = express();
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

app.get("/", (req, res) => res.send("Express on Vercel"));

const supabaseUrl = "https://ykcecftnsyyclchogssh.supabase.co";
const supabase = createClient(supabaseUrl, process.env.SUPABASE_KEY);
const corsOptions = {
    origin: [
      'chrome-extension://eeikkhebkpoeajjjdhnnnhpgdnepgghc',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

app.use(cors(corsOptions));
app.use(express.json());

app.post("/register", async (req, res) => {
    const userData = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                emailRedirectTo: "https://eeikkhebkpoeajjjdhnnnhpgdnepgghc.chromiumapp.org/"
            }
        })

        const { _, err } = await supabase
            .from("users")
            .insert({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email
            });

        if (err) throw error;

        res.status(200).json({ message: "User registered successfully", data });
    } catch (error) {
        console.error("Error registering user: ", error);
        res.status(500).json({ error: "Failed to register user" });
    }
})

app.post("/login", async (req, res) => {
    try {
        const userData = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: userData.password
        });

        console.log("Supabase user data: ", data);

        if (error) throw error;

        const { data: user, error: err } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user?.id)
            .single();

        console.log("User info: ", user);

        if (err) throw err;

        res.status(200).json({
            user: data.user,
            firstName: user.first_name,
            lastName: user.last_name
        });
    } catch (error) {
        console.error("Error logging in user: ", error);
        res.status(500).json({ error });
    }
});

app.get("/logout", async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Error logging out user: ", error);
        res.status(500).json({ error: "Failed to logout user" });
    }
})

app.post("/add_job", async (req, res) => {
    const jobData = req.body;

    try {
        const { data, error } = await supabase
            .from("job_applications")
            .insert(jobData);

        if (error) throw error;

        res.status(200).json({ message: "Job application added successfully", data });
    } catch (error) {
        console.error("Error adding job application: ", error);
        res.status(500).json({ error: "Failed to add job application" });
    }
});

app.get("/get_jobs", async (req, res) => {
    const { user_id } = req.query;

    try {
        const { data, error } = await supabase
            .from("job_applications")
            .select("*")
            .eq("user_id", user_id)
            .order("timestamp", { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching job applications: ", error);
        res.status(500).json({ error: "Failed to fetch job applications." });
    }
});

app.put("/update_job", async (req, res) => {
    const { jobId, status } = req.body;
    console.log("Updating Job ID ", jobId, " with status ", status);
    try {
        const { data, error } = await supabase
            .from("job_applications")
            .update({ status })
            .eq("id", jobId);

        if (error) throw error;

        res.status(200).json({ message: "Job application updated successfully", data });
    } catch (error) {
        console.error("Error updating job application: ", error);
        res.status(500).json({ error: "Failed to update job application" });
    }
})

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;