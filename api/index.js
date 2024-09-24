const express = require("express");
const app = express();
const { createClient } = require("@supabase/supabase-js");

app.get("/", (req, res) => res.send("Express on Vercel"));

const supabaseUrl = "https://ykcecftnsyyclchogssh.supabase.co";
const supabase = createClient(supabaseUrl, process.env.SUPABASE_KEY);

app.get("/get_jobs", async (req, res) => {
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
            .eq("user_id", user_id);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching job applications: ", error);
        res.status(500).json({ error: "Failed to fetch job applications." });
    }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;