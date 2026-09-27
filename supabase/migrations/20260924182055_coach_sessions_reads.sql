-- 1. Dashboard Summary
CREATE OR REPLACE FUNCTION coach_get_dashboard_summary()
RETURNS json LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
    v_today_sessions INT;
    v_pending_assessments INT;
BEGIN
    -- Count today's sessions assigned to this coach
    SELECT COUNT(*) INTO v_today_sessions
    FROM programme_sessions ps
    JOIN session_coaches sc ON sc.session_id = ps.id
    WHERE sc.coach_id = (SELECT id FROM coaches WHERE account_id = auth.uid()) 
    AND ps.session_date = CURRENT_DATE;

    -- Count pending assessment appointments (null coach or assigned to this coach)
    SELECT COUNT(*) INTO v_pending_assessments
    FROM appointments a
    WHERE a.type = 'assessment' 
    AND a.status = 'pending'
    AND (a.coach_id IS NULL OR a.coach_id = (SELECT id FROM coaches WHERE account_id = auth.uid()));
    
    RETURN json_build_object(
        'today_sessions', v_today_sessions, 
        'pending_assessments', v_pending_assessments
    );
END;
$$;

-- 2. Get Sessions for Calendar/List
CREATE OR REPLACE FUNCTION coach_get_sessions(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    session_id INT, 
    programme_name VARCHAR, 
    session_date DATE, 
    start_time TIME, 
    end_time TIME,
    venue_name VARCHAR,
    enrolled_count INT
) LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ps.id, 
        p.name AS programme_name, 
        ps.session_date, 
        ps.start_time, 
        ps.end_time,
        v.name AS venue_name,
        (SELECT COUNT(*)::INT FROM enrolments e WHERE e.programme_id = ps.programme_id AND e.status = 'active') AS enrolled_count
    FROM programme_sessions ps
    JOIN programmes p ON p.id = ps.programme_id
    JOIN venues v ON v.id = ps.venue_id
    JOIN session_coaches sc ON sc.session_id = ps.id
    WHERE sc.coach_id = (SELECT id FROM coaches WHERE account_id = auth.uid()) 
    AND ps.session_date BETWEEN p_start_date AND p_end_date;
END;
$$;

-- 3. Get Single Session Detail (Overview Tab)
CREATE OR REPLACE FUNCTION coach_get_session_detail(p_session_id INT)
RETURNS json LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE
    v_result json;
BEGIN
    SELECT json_build_object(
        'session_id', ps.id,
        'programme_name', p.name,
        'venue_name', v.name,
        'start_time', ps.start_time,
        'end_time', ps.end_time,
        'max_ratio', p.max_ratio,
        'enrolled_count', (SELECT COUNT(*) FROM enrolments e WHERE e.programme_id = ps.programme_id AND e.status = 'active')
    ) INTO v_result
    FROM programme_sessions ps
    JOIN programmes p ON p.id = ps.programme_id
    JOIN venues v ON v.id = ps.venue_id
    JOIN session_coaches sc ON sc.session_id = ps.id
    WHERE ps.id = p_session_id 
    AND sc.coach_id = (SELECT id FROM coaches WHERE account_id = auth.uid());

    RETURN v_result;
END;
$$;

-- 4. Get Session Roster (Backs the Roster & Attendance Tab)
CREATE OR REPLACE FUNCTION coach_get_session_roster(p_session_id INT)
RETURNS TABLE (
    member_id INT, 
    full_name VARCHAR, 
    attendance_status VARCHAR
) LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS member_id, 
        m.full_name, 
        a.status AS attendance_status
    FROM enrolments e
    JOIN programme_sessions ps ON ps.programme_id = e.programme_id
    JOIN members m ON m.id = e.member_id
    JOIN session_coaches sc ON sc.session_id = ps.id
    LEFT JOIN attendance a ON a.session_id = ps.id AND a.member_id = m.id
    WHERE ps.id = p_session_id 
    AND sc.coach_id = (SELECT id FROM coaches WHERE account_id = auth.uid())
    AND e.status = 'active';
END;
$$;

-- 5. Get Session Curriculum (Backs Notes & Curriculum)
CREATE OR REPLACE FUNCTION coach_get_session_curriculum(p_session_id INT)
RETURNS TABLE (
    module_id INT, 
    module_name VARCHAR, 
    category VARCHAR,
    is_tagged BOOLEAN
) LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id AS module_id, 
        cm.name AS module_name, 
        cm.category,
        CASE WHEN scm.session_id IS NOT NULL THEN true ELSE false END AS is_tagged
    FROM programme_sessions ps
    JOIN programmes p ON p.id = ps.programme_id
    JOIN curriculum_modules cm ON cm.level_id = p.level_id
    LEFT JOIN session_curriculum_modules scm ON scm.curriculum_module_id = cm.id AND scm.session_id = ps.id
    JOIN session_coaches sc ON sc.session_id = ps.id
    WHERE ps.id = p_session_id
    AND sc.coach_id = (SELECT id FROM coaches WHERE account_id = auth.uid());
END;
$$;