-- Mutation: Mark individual attendance (Upsert)
CREATE OR REPLACE FUNCTION coach_mark_attendance(p_session_id INT, p_member_id INT, p_status VARCHAR)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
    INSERT INTO attendance (session_id, member_id, status)
    VALUES (p_session_id, p_member_id, p_status)
    ON CONFLICT (session_id, member_id) 
    DO UPDATE SET status = EXCLUDED.status;
END;
$$;

-- Mutation: Bulk mark all present
CREATE OR REPLACE FUNCTION coach_bulk_mark_attendance(p_session_id INT, p_status VARCHAR)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
    -- Assumes a view or join exists to get all enrolled members for the session's programme
    INSERT INTO attendance (session_id, member_id, status)
    SELECT p_session_id, e.member_id, p_status
    FROM enrolments e
    JOIN programme_sessions ps ON e.programme_id = ps.programme_id
    WHERE ps.id = p_session_id AND e.status = 'active'
    ON CONFLICT (session_id, member_id) 
    DO UPDATE SET status = EXCLUDED.status;
END;
$$;

-- Mutation: Save Coach Notes
CREATE OR REPLACE FUNCTION coach_save_session_notes(p_session_id INT, p_notes TEXT)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
    UPDATE programme_sessions 
    SET coach_notes = p_notes
    WHERE id = p_session_id;
END;
$$;