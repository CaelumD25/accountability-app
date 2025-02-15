const api = {
    // Gets the number of blunders recorded in the database
    async getBlunders(): Promise<number> {
        const response = await fetch("/api/blunders");
        if (!response.ok) throw new Error("Failed to fetch blunders");
        const data = await response.json();
        return data[0].totalBlunders;
    },

    // Adds the number of blunders to the default item by the number passed in
    async addBlunders(add: number): Promise<number> {
        const baseUrl = window.location.origin;
        const url = new URL("api/blunders", baseUrl);

        // Just modifies the default
        url.searchParams.append("add", String(add));

        const response = await fetch(url, { method: "PATCH" });
        if (!response.ok) throw new Error("Failed to add blunders");
        const data = await response.json();
        return data.blunders;
    }
};

export default api;