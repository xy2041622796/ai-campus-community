-- 009_event_notifications.sql
-- Notify event organizer when someone joins

CREATE OR REPLACE FUNCTION handle_event_participant_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, post_id)
  SELECT e.organizer_id, 'comment', NEW.user_id, NULL
  FROM public.events e
  WHERE e.id = NEW.event_id AND e.organizer_id != NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_participant_insert ON public.event_participants;
CREATE TRIGGER on_event_participant_insert
  AFTER INSERT ON public.event_participants
  FOR EACH ROW
  EXECUTE FUNCTION handle_event_participant_notification();
