-- Migration: Add Push Notifications Support
-- Version: 1.2.0
-- Date: 2025-10-14

-- Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_name VARCHAR(255),
  device_model VARCHAR(255),
  os_version VARCHAR(50),
  app_version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for device_tokens
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active) WHERE is_active = true;

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  water_reminders BOOLEAN DEFAULT true,
  water_reminder_times TEXT[], -- Array of times like ['08:00', '12:00', '16:00', '20:00']
  meal_reminders BOOLEAN DEFAULT true,
  meal_reminder_times TEXT[], -- Array of times like ['07:00', '12:00', '19:00']
  exercise_reminders BOOLEAN DEFAULT true,
  exercise_reminder_times TEXT[],
  community_notifications BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  goal_progress_notifications BOOLEAN DEFAULT true,
  weekly_report BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_history table
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'clicked')),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP,
  clicked_at TIMESTAMP,
  error_message TEXT
);

-- Create indexes for notification_history
CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_type ON notification_history(notification_type);
CREATE INDEX idx_notification_history_sent_at ON notification_history(sent_at DESC);
CREATE INDEX idx_notification_history_status ON notification_history(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_device_tokens_updated_at
    BEFORE UPDATE ON device_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Create view for active devices by user
CREATE OR REPLACE VIEW user_active_devices AS
SELECT 
  user_id,
  COUNT(*) as device_count,
  array_agg(platform) as platforms,
  MAX(last_used_at) as last_activity
FROM device_tokens
WHERE is_active = true
GROUP BY user_id;

-- Create view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  notification_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'clicked')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE status = 'delivered'), 0) * 100,
    2
  ) as click_rate
FROM notification_history
GROUP BY user_id, notification_type;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON device_tokens TO app_user;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO app_user;
GRANT SELECT, INSERT, UPDATE ON notification_history TO app_user;
GRANT SELECT ON user_active_devices TO app_user;
GRANT SELECT ON notification_stats TO app_user;

-- Comments
COMMENT ON TABLE device_tokens IS 'Stores FCM device tokens for push notifications';
COMMENT ON TABLE notification_preferences IS 'User preferences for various notification types';
COMMENT ON TABLE notification_history IS 'History of all sent notifications for tracking';
COMMENT ON VIEW user_active_devices IS 'Summary of active devices per user';
COMMENT ON VIEW notification_stats IS 'Notification engagement statistics per user';
