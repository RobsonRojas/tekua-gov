-- Migration: Create RPC to notify members when surreal receipt occurs
-- Date: 2026-08-16

-- RPC: Dispatch notifications to all members when a surreal transaction is created
CREATE OR REPLACE FUNCTION public.notify_surreal_receipt(p_transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction RECORD;
  v_members RECORD;
  v_notif_count INT := 0;
  v_base_url TEXT := 'https://tekua-gov.vercel.app';
BEGIN
  -- 1. Fetch transaction details with sender/recipient names
  SELECT 
    t.id,
    t.from_id,
    t.to_id,
    t.amount,
    t.description,
    t.created_at,
    fp.full_name AS sender_name,
    tp.full_name AS recipient_name
  INTO v_transaction
  FROM transactions t
  LEFT JOIN profiles fp ON t.from_id = fp.id
  LEFT JOIN profiles tp ON t.to_id = tp.id
  WHERE t.id = p_transaction_id;

  -- 2. Check if transaction exists and from_id is not null (exclude minting)
  IF v_transaction.id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF v_transaction.from_id IS NULL THEN
    -- This is a minting transaction, skip notifications
    RETURN jsonb_build_object('success', true, 'notified_count', 0, 'reason', 'minting_skipped');
  END IF;

  -- 3. Create notifications for all members except sender and recipient (to avoid noise)
  -- notification.data stores the full transaction context for email/push templates
  FOR v_members IN 
    SELECT id FROM profiles 
    WHERE id != v_transaction.from_id 
      AND id != v_transaction.to_id
  LOOP
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      link,
      data
    ) VALUES (
      v_members.id,
      jsonb_build_object('pt', 'Surreais Ganhos', 'en', 'Surreal Received'),
      jsonb_build_object(
        'pt', v_transaction.recipient_name || ' recebeu ' || v_transaction.amount || ' $S de ' || v_transaction.sender_name,
        'en', v_transaction.recipient_name || ' received ' || v_transaction.amount || ' $S from ' || v_transaction.sender_name
      ),
      'surreal_receipt',
      '/share/surreal/' || v_transaction.id,
      jsonb_build_object(
        'transactionId', v_transaction.id,
        'amount', v_transaction.amount,
        'senderName', v_transaction.sender_name,
        'recipientName', v_transaction.recipient_name,
        'description', v_transaction.description,
        'createdAt', v_transaction.created_at
      )
    );
    
    v_notif_count := v_notif_count + 1;
  END LOOP;

  -- 4. Log success
  RAISE NOTICE 'Surreal receipt notifications created: % for transaction %', v_notif_count, p_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction.id,
    'notified_count', v_notif_count,
    'sender_name', v_transaction.sender_name,
    'recipient_name', v_transaction.recipient_name,
    'amount', v_transaction.amount
  );
END;
$$;
