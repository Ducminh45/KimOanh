-- Migration: Add Analytics & Tracking Tables
-- Version: 1.2.0
-- Date: 2025-10-14

-- Create user_sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  app_version VARCHAR(50),
  platform VARCHAR(20),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Create user_events table for analytics
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  properties JSONB,
  screen_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create app_metrics table
CREATE TABLE IF NOT EXISTS app_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type VARCHAR(100) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(50),
  tags JSONB,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  severity VARCHAR(20) DEFAULT 'error' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at DESC);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;

-- Create indexes for user_events
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_created_at ON user_events(created_at DESC);
CREATE INDEX idx_user_events_event_type ON user_events(event_type);
CREATE INDEX idx_user_events_event_name ON user_events(event_name);
CREATE INDEX idx_user_events_properties ON user_events USING GIN (properties);

-- Create indexes for app_metrics
CREATE INDEX idx_app_metrics_metric_type ON app_metrics(metric_type);
CREATE INDEX idx_app_metrics_recorded_at ON app_metrics(recorded_at DESC);
CREATE INDEX idx_app_metrics_tags ON app_metrics USING GIN (tags);

-- Create indexes for error_logs
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved) WHERE resolved = false;

-- Create materialized view for daily active users
CREATE MATERIALIZED VIEW daily_active_users AS
SELECT 
  DATE(started_at) as date,
  COUNT(DISTINCT user_id) as dau,
  COUNT(*) as total_sessions,
  AVG(duration_seconds) as avg_session_duration,
  COUNT(*) FILTER (WHERE platform = 'ios') as ios_sessions,
  COUNT(*) FILTER (WHERE platform = 'android') as android_sessions
FROM user_sessions
WHERE started_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- Create index for materialized view
CREATE UNIQUE INDEX idx_dau_date ON daily_active_users(date);

-- Create view for popular events
CREATE OR REPLACE VIEW popular_events AS
SELECT 
  event_type,
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE(created_at) as date
FROM user_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY event_type, event_name, DATE(created_at)
ORDER BY event_count DESC;

-- Create view for error summary
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  error_type,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users,
  MAX(created_at) as last_occurred,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count
FROM error_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY error_type
ORDER BY error_count DESC;

-- Create function to end session
CREATE OR REPLACE FUNCTION end_user_session(p_session_id VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE user_sessions
  SET 
    ended_at = CURRENT_TIMESTAMP,
    duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER,
    is_active = false
  WHERE session_id = p_session_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to refresh DAU materialized view
CREATE OR REPLACE FUNCTION refresh_dau_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_active_users;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS VOID AS $$
BEGIN
  -- Delete sessions older than 90 days
  DELETE FROM user_sessions WHERE started_at < CURRENT_DATE - INTERVAL '90 days';
  
  -- Delete events older than 90 days
  DELETE FROM user_events WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
  
  -- Delete resolved errors older than 30 days
  DELETE FROM error_logs WHERE resolved = true AND resolved_at < CURRENT_DATE - INTERVAL '30 days';
  
  -- Delete old metrics
  DELETE FROM app_metrics WHERE recorded_at < CURRENT_DATE - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_sessions TO app_user;
GRANT SELECT, INSERT ON user_events TO app_user;
GRANT SELECT, INSERT ON app_metrics TO app_user;
GRANT SELECT, INSERT, UPDATE ON error_logs TO app_user;
GRANT SELECT ON daily_active_users TO app_user;
GRANT SELECT ON popular_events TO app_user;
GRANT SELECT ON error_summary TO app_user;

-- Comments
COMMENT ON TABLE user_sessions IS 'Tracks user sessions for analytics';
COMMENT ON TABLE user_events IS 'Stores all user events for analytics';
COMMENT ON TABLE app_metrics IS 'Application performance and business metrics';
COMMENT ON TABLE error_logs IS 'Application error logging and tracking';
COMMENT ON MATERIALIZED VIEW daily_active_users IS 'Daily active user statistics';
COMMENT ON VIEW popular_events IS 'Most popular user events in last 30 days';
COMMENT ON VIEW error_summary IS 'Error summary for last 7 days';
