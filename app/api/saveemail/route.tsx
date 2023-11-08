import { drizzle } from 'drizzle-orm/d1';
import { eq } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import type { NextRequest } from "next/server";
import type { D1Database } from '@cloudflare/workers-types';
const { IDENTITY_DB } = (process.env as any as { IDENTITY_DB: D1Database });
import { token } from '@/app/token';
 

const users = sqliteTable('user', {
    id: text('id').notNull(),
    username: text('username').notNull(),
    email: text('email').notNull().default(''),
});


export const POST = async (request: NextRequest) => {

    const auth = request.headers.get('Authorization')?.split(' ');
    if (auth && auth[1] === token) {
        const req: { userId: string; email: string } = await request.json();
    
        const db = drizzle(IDENTITY_DB);
        const results = await db.update(users).set({ email: req.email }).where(eq(users.id, req.userId)).returning({ updatedId: users.id });
    
        return new Response(JSON.stringify(results), {
            status: 200,
            headers: {
                'Content-Type': 'application/data'
            }
        });
    }

    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
            'Content-Type': 'application/data'
        }
    });
}



