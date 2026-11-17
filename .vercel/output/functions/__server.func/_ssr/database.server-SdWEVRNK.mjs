import { t as Pool } from "../_libs/pg.mjs";
// node_modules/.nitro/vite/services/ssr/assets/database.server-SdWEVRNK.js
var pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
	idleTimeoutMillis: 3e4,
	connectionTimeoutMillis: 1e4,
	ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : void 0
});
pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error", error);
});
export { pool };
