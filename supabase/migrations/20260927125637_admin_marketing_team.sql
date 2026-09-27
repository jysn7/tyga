-- 1. Create the Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Read Function: Get all team members (Ordered by sort_order)
CREATE OR REPLACE FUNCTION admin_get_team()
RETURNS TABLE (
    id INT,
    name VARCHAR,
    role VARCHAR,
    bio TEXT,
    image_url TEXT,
    sort_order INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY SELECT t.id, t.name, t.role, t.bio, t.image_url, t.sort_order 
    FROM team_members t
    ORDER BY t.sort_order ASC, t.id ASC;
END;
$$;

-- 3. Write Function: Add a new team member
CREATE OR REPLACE FUNCTION admin_add_team_member(
    p_name VARCHAR, 
    p_role VARCHAR, 
    p_bio TEXT, 
    p_image_url TEXT,
    p_sort_order INT DEFAULT 0
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO team_members (name, role, bio, image_url, sort_order)
    VALUES (p_name, p_role, p_bio, p_image_url, p_sort_order);
END;
$$;

-- 4. Write Function: Delete a team member
CREATE OR REPLACE FUNCTION admin_delete_team_member(p_id INT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    DELETE FROM team_members WHERE id = p_id;
END;
$$;