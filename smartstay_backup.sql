--
-- PostgreSQL database dump
--

\restrict SDB23xI3lWS38184Q9cYtXHlUn3fNGZUdrEaY3EYF4GR5jB8htdpSQsZHYoyu3c

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: delete_expired_pending_bookings(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_expired_pending_bookings() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM pending_bookings WHERE expires_at < NOW();
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_activity_logs (
    id integer NOT NULL,
    actor_user_id integer,
    action character varying(120) NOT NULL,
    description text NOT NULL,
    ip_address character varying(100) DEFAULT ''::character varying,
    user_agent text DEFAULT ''::text,
    target_user_id integer,
    target_property_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_activity_logs_id_seq OWNED BY public.admin_activity_logs.id;


--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_notifications (
    id integer NOT NULL,
    type character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    target_user_id integer,
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    subject_id integer
);


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_notifications_id_seq OWNED BY public.admin_notifications.id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    property_id integer NOT NULL,
    guest_id integer NOT NULL,
    host_id integer NOT NULL,
    check_in timestamp with time zone NOT NULL,
    check_out timestamp with time zone NOT NULL,
    check_in_time character varying(20) DEFAULT ''::character varying,
    check_out_time character varying(20) DEFAULT ''::character varying,
    booking_type character varying(20) DEFAULT 'fixed'::character varying NOT NULL,
    guests integer DEFAULT 1 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    special_requests text DEFAULT ''::text,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT bookings_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'partial'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))),
    CONSTRAINT bookings_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    sender character varying(10) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_messages_sender_check CHECK (((sender)::text = ANY ((ARRAY['user'::character varying, 'bot'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id integer NOT NULL,
    session_id character varying(255) NOT NULL,
    user_id integer,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ended_at timestamp without time zone,
    message_count integer DEFAULT 0,
    resolved boolean DEFAULT false,
    feedback character varying(20),
    escalated boolean DEFAULT false,
    escalated_at timestamp without time zone,
    admin_joined boolean DEFAULT false,
    admin_id integer,
    resolution_notes text,
    CONSTRAINT chat_sessions_feedback_check CHECK (((feedback)::text = ANY ((ARRAY['positive'::character varying, 'negative'::character varying, 'none'::character varying])::text[])))
);


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_sessions_id_seq OWNED BY public.chat_sessions.id;


--
-- Name: chatbot_messages_backup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chatbot_messages_backup (
    id integer CONSTRAINT chatbot_messages_id_not_null NOT NULL,
    session_id character varying(120) CONSTRAINT chatbot_messages_session_id_not_null NOT NULL,
    user_id integer,
    sender character varying(20) CONSTRAINT chatbot_messages_sender_not_null NOT NULL,
    message text CONSTRAINT chatbot_messages_message_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT now() CONSTRAINT chatbot_messages_created_at_not_null NOT NULL,
    CONSTRAINT chatbot_messages_sender_check CHECK (((sender)::text = ANY ((ARRAY['user'::character varying, 'assistant'::character varying])::text[])))
);


--
-- Name: chatbot_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chatbot_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chatbot_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chatbot_messages_id_seq OWNED BY public.chatbot_messages_backup.id;


--
-- Name: chatbot_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chatbot_settings (
    id integer DEFAULT 1 NOT NULL,
    enabled boolean DEFAULT true,
    welcome_message text,
    fallback_message text,
    response_delay integer DEFAULT 3000,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: communication_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_settings (
    id integer DEFAULT 1 NOT NULL,
    email_notifications boolean DEFAULT true,
    message_alerts boolean DEFAULT true,
    chatbot_alerts boolean DEFAULT false,
    auto_response boolean DEFAULT true,
    response_time_hours integer DEFAULT 2,
    max_concurrent_chats integer DEFAULT 10,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT communication_settings_single_row CHECK ((id = 1))
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    subject character varying(500),
    message text NOT NULL,
    status character varying(50) DEFAULT 'unread'::character varying,
    replied_at timestamp without time zone,
    reply_message text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    guest_id integer NOT NULL,
    host_id integer NOT NULL,
    issue text NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    resolution text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    resolved_at timestamp without time zone,
    resolved_by integer,
    CONSTRAINT disputes_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))),
    CONSTRAINT disputes_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'investigating'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[])))
);


--
-- Name: disputes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.disputes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: disputes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.disputes_id_seq OWNED BY public.disputes.id;


--
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) DEFAULT 'general'::character varying,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    property_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: host_expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.host_expenses (
    id integer NOT NULL,
    host_user_id integer NOT NULL,
    expense_date date NOT NULL,
    type character varying(100) DEFAULT ''::character varying NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    property character varying(255) DEFAULT ''::character varying NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    category character varying(120) DEFAULT ''::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: host_expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.host_expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: host_expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.host_expenses_id_seq OWNED BY public.host_expenses.id;


--
-- Name: host_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.host_reviews (
    id integer NOT NULL,
    host_id integer NOT NULL,
    guest_id integer NOT NULL,
    booking_id integer,
    rating integer NOT NULL,
    comment text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT host_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: host_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.host_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: host_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.host_reviews_id_seq OWNED BY public.host_reviews.id;


--
-- Name: host_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.host_verifications (
    id integer NOT NULL,
    host_user_id integer NOT NULL,
    business_name character varying(255) NOT NULL,
    business_type character varying(100) NOT NULL,
    business_address text NOT NULL,
    id_type character varying(100) NOT NULL,
    id_number character varying(100) NOT NULL,
    tax_id character varying(100) DEFAULT ''::character varying,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    rejection_reason text DEFAULT ''::text,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp without time zone,
    reviewed_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT host_verifications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: host_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.host_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: host_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.host_verifications_id_seq OWNED BY public.host_verifications.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id character varying(120) NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    property_id integer,
    booking_id integer,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer,
    subject character varying(255),
    status character varying(20) DEFAULT 'unread'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    category character varying(50) DEFAULT 'general'::character varying,
    replied_at timestamp without time zone,
    replied_by integer,
    reply_message text,
    CONSTRAINT chk_messages_category CHECK (((category)::text = ANY ((ARRAY['booking'::character varying, 'payment'::character varying, 'communication'::character varying, 'amenities'::character varying, 'feedback'::character varying, 'complaint'::character varying, 'property'::character varying, 'general'::character varying])::text[]))),
    CONSTRAINT chk_messages_priority CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'normal'::character varying, 'high'::character varying, 'urgent'::character varying])::text[]))),
    CONSTRAINT chk_messages_status CHECK (((status)::text = ANY ((ARRAY['unread'::character varying, 'read'::character varying, 'sent'::character varying, 'flagged'::character varying])::text[])))
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    booking_id integer NOT NULL,
    payer_user_id integer NOT NULL,
    host_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'PHP'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    payment_method character varying(50) NOT NULL,
    transaction_id character varying(255) DEFAULT ''::character varying,
    reference_number character varying(255) DEFAULT ''::character varying,
    processing_fee numeric(12,2) DEFAULT 0 NOT NULL,
    host_payout numeric(12,2) DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))
);


--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: payouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payouts (
    id integer NOT NULL,
    host_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'PHP'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    payout_method character varying(50) DEFAULT 'bank_transfer'::character varying NOT NULL,
    notes text DEFAULT ''::text,
    approved_by integer,
    approved_at timestamp without time zone,
    rejection_reason text DEFAULT ''::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    CONSTRAINT payouts_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: payouts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payouts_id_seq OWNED BY public.payouts.id;


--
-- Name: pending_bookings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_bookings (
    id integer NOT NULL,
    pending_id character varying(100) NOT NULL,
    guest_id integer,
    booking_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL
);


--
-- Name: pending_bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pending_bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pending_bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pending_bookings_id_seq OWNED BY public.pending_bookings.id;


--
-- Name: promo_code_properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promo_code_properties (
    promo_code_id integer NOT NULL,
    property_id integer NOT NULL
);


--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promo_codes (
    id integer NOT NULL,
    host_id integer NOT NULL,
    code character varying(50) NOT NULL,
    type character varying(20) NOT NULL,
    value numeric(10,2) NOT NULL,
    description text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    usage_limit integer NOT NULL,
    used_count integer DEFAULT 0,
    min_booking_amount numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT promo_codes_check CHECK ((end_date >= start_date)),
    CONSTRAINT promo_codes_check1 CHECK ((used_count <= usage_limit)),
    CONSTRAINT promo_codes_min_booking_amount_check CHECK ((min_booking_amount >= (0)::numeric)),
    CONSTRAINT promo_codes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'paused'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT promo_codes_type_check CHECK (((type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[]))),
    CONSTRAINT promo_codes_usage_limit_check CHECK ((usage_limit > 0)),
    CONSTRAINT promo_codes_used_count_check CHECK ((used_count >= 0)),
    CONSTRAINT promo_codes_value_check CHECK ((value > (0)::numeric))
);


--
-- Name: TABLE promo_codes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.promo_codes IS 'Stores promotional discount codes created by hosts';


--
-- Name: promo_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promo_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: promo_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promo_codes_id_seq OWNED BY public.promo_codes.id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id integer NOT NULL,
    host_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    type character varying(100) NOT NULL,
    bedrooms integer NOT NULL,
    bathrooms integer NOT NULL,
    max_guests integer NOT NULL,
    price_per_night numeric(10,2) NOT NULL,
    address jsonb DEFAULT '{}'::jsonb NOT NULL,
    amenities text[] DEFAULT ARRAY[]::text[],
    images text[] DEFAULT ARRAY[]::text[],
    availability boolean DEFAULT true,
    rating numeric(3,1) DEFAULT 0,
    review_count integer DEFAULT 0,
    time_availability jsonb DEFAULT '{"checkInTime": "15:00", "checkOutTime": "11:00"}'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    payment_methods jsonb DEFAULT '{"cash": true, "gcash": false, "paymaya": false, "bankTransfer": false}'::jsonb
);


--
-- Name: properties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.properties_id_seq OWNED BY public.properties.id;


--
-- Name: property_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.property_reviews (
    id integer NOT NULL,
    property_id integer NOT NULL,
    booking_id integer,
    guest_id integer NOT NULL,
    host_id integer NOT NULL,
    rating integer NOT NULL,
    comment text DEFAULT ''::text NOT NULL,
    cleanliness integer DEFAULT 0 NOT NULL,
    accuracy integer DEFAULT 0 NOT NULL,
    communication integer DEFAULT 0 NOT NULL,
    location integer DEFAULT 0 NOT NULL,
    check_in integer DEFAULT 0 NOT NULL,
    value integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    host_reply text,
    host_reply_date timestamp without time zone,
    CONSTRAINT property_reviews_accuracy_check CHECK (((accuracy >= 0) AND (accuracy <= 5))),
    CONSTRAINT property_reviews_check_in_check CHECK (((check_in >= 0) AND (check_in <= 5))),
    CONSTRAINT property_reviews_cleanliness_check CHECK (((cleanliness >= 0) AND (cleanliness <= 5))),
    CONSTRAINT property_reviews_communication_check CHECK (((communication >= 0) AND (communication <= 5))),
    CONSTRAINT property_reviews_location_check CHECK (((location >= 0) AND (location <= 5))),
    CONSTRAINT property_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT property_reviews_value_check CHECK (((value >= 0) AND (value <= 5)))
);


--
-- Name: property_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.property_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: property_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.property_reviews_id_seq OWNED BY public.property_reviews.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    settings jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT system_settings_singleton CHECK ((id = 1))
);


--
-- Name: system_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_status (
    id integer NOT NULL,
    service_name character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'online'::character varying,
    last_checked timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_status_status_check CHECK (((status)::text = ANY ((ARRAY['online'::character varying, 'offline'::character varying, 'maintenance'::character varying])::text[])))
);


--
-- Name: system_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_status_id_seq OWNED BY public.system_status.id;


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(80) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    subject_id integer
);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_notifications_id_seq OWNED BY public.user_notifications.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    user_id integer NOT NULL,
    bio text DEFAULT ''::text NOT NULL,
    profile_picture text DEFAULT ''::text NOT NULL,
    preferences jsonb DEFAULT '{"smsAlerts": false, "emailUpdates": true, "notifications": true}'::jsonb NOT NULL,
    host_info jsonb DEFAULT '{}'::jsonb NOT NULL,
    guest_info jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50) DEFAULT ''::character varying,
    company character varying(255) DEFAULT ''::character varying,
    password_hash text NOT NULL,
    role character varying(50) DEFAULT 'guest'::character varying NOT NULL,
    verification_status character varying(50) DEFAULT 'not_required'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    email_verified boolean DEFAULT false,
    verification_token character varying(255),
    verification_token_expires timestamp without time zone,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'communication_admin'::character varying, 'host'::character varying, 'guest'::character varying])::text[]))),
    CONSTRAINT users_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['verified'::character varying, 'not_submitted'::character varying, 'not_required'::character varying, 'pending'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admin_activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_activity_logs_id_seq'::regclass);


--
-- Name: admin_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications ALTER COLUMN id SET DEFAULT nextval('public.admin_notifications_id_seq'::regclass);


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: chat_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions ALTER COLUMN id SET DEFAULT nextval('public.chat_sessions_id_seq'::regclass);


--
-- Name: chatbot_messages_backup id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chatbot_messages_backup ALTER COLUMN id SET DEFAULT nextval('public.chatbot_messages_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: disputes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes ALTER COLUMN id SET DEFAULT nextval('public.disputes_id_seq'::regclass);


--
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: host_expenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_expenses ALTER COLUMN id SET DEFAULT nextval('public.host_expenses_id_seq'::regclass);


--
-- Name: host_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_reviews ALTER COLUMN id SET DEFAULT nextval('public.host_reviews_id_seq'::regclass);


--
-- Name: host_verifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_verifications ALTER COLUMN id SET DEFAULT nextval('public.host_verifications_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: payouts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts ALTER COLUMN id SET DEFAULT nextval('public.payouts_id_seq'::regclass);


--
-- Name: pending_bookings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_bookings ALTER COLUMN id SET DEFAULT nextval('public.pending_bookings_id_seq'::regclass);


--
-- Name: promo_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes ALTER COLUMN id SET DEFAULT nextval('public.promo_codes_id_seq'::regclass);


--
-- Name: properties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties ALTER COLUMN id SET DEFAULT nextval('public.properties_id_seq'::regclass);


--
-- Name: property_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_reviews ALTER COLUMN id SET DEFAULT nextval('public.property_reviews_id_seq'::regclass);


--
-- Name: system_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_status ALTER COLUMN id SET DEFAULT nextval('public.system_status_id_seq'::regclass);


--
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications ALTER COLUMN id SET DEFAULT nextval('public.user_notifications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admin_activity_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_activity_logs (id, actor_user_id, action, description, ip_address, user_agent, target_user_id, target_property_id, created_at) FROM stdin;
793	1040	host_verification_approved	Approved host verification for host ID 8	::1	Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36 Edg/147.0.0.0	8	\N	2026-05-03 16:49:13.041427
\.


--
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_notifications (id, type, title, message, target_user_id, priority, is_read, created_at, subject_id) FROM stdin;
2	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
3	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
5	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
6	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
8	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
9	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
11	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
12	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
14	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
15	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
17	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
18	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
20	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
21	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
23	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
24	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
26	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
27	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
29	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
30	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
32	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
33	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
35	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
36	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
38	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
39	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
41	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
42	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
44	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
45	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
47	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
48	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
50	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
51	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
53	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
54	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
56	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
57	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
59	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
60	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
62	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
63	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
65	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
66	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
68	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
69	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
71	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
72	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
74	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
75	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
77	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
78	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
80	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
81	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
83	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
84	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
86	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
87	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
89	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
90	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
92	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
93	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
95	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
96	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
98	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
99	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
101	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
102	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
104	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
105	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
107	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
108	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
110	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
111	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
113	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
114	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
116	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
117	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
119	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
120	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
122	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
123	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
125	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
126	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
128	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
129	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
131	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
132	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
134	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
135	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
137	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
138	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
140	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
141	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
143	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
144	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
146	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
147	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
149	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
150	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
152	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
153	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
155	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
156	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
158	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
159	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
161	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
162	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
164	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
165	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
167	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
168	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
170	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
171	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
173	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
174	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
176	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
177	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
179	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
180	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
182	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
183	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
185	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
186	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
188	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
189	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
191	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
192	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
194	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
195	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
197	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
198	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
200	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
201	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
203	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
204	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
206	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
207	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
209	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
210	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
212	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
213	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
215	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
216	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
218	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
219	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
221	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
222	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
224	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
225	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
227	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
228	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
230	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
231	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
233	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
234	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
236	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
237	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
239	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
240	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
242	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
243	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
245	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
246	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
248	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
249	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
251	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
252	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
254	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
255	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
257	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
258	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
260	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
261	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
263	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
264	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
266	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
267	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
269	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
270	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
272	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
273	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
275	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
276	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
278	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
279	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
281	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
282	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
284	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
285	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
287	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
288	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
290	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
291	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
293	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
294	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
296	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
297	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
299	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
300	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
302	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
303	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
305	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
306	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
308	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
309	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
311	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
312	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
314	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
315	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
317	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
318	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
320	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
321	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
323	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
324	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
326	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
327	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
329	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
330	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
332	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
333	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
335	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
336	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
338	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
339	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
341	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
342	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
344	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
345	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
347	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
348	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
350	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
351	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
353	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
354	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
356	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
357	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
359	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
360	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
362	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
363	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
365	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
366	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
368	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
369	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
371	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
372	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
374	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
375	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
377	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
378	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
380	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
381	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
383	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
384	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
386	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
387	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
389	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
390	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
392	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
393	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
395	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
396	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
398	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
399	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
401	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
402	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
404	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
405	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
407	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
408	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
410	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
411	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
413	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
414	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
416	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
417	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
419	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
420	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
422	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
423	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
425	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
426	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
428	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
429	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
431	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
432	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
434	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
435	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
437	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
438	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
440	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
441	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
443	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
444	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
446	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
447	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
449	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
450	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
452	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
453	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
455	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
456	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
458	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
459	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
461	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
462	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
464	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
465	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
467	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
468	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
470	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
471	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
473	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
474	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
476	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
477	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
479	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
480	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
482	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
483	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
485	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
486	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
488	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
489	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
491	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
492	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
494	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
495	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
497	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
498	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
500	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
501	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
503	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
504	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
506	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
507	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
509	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
510	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
512	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
513	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
515	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
516	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
518	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
519	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
521	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
522	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
524	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
525	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
527	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
528	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
530	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
531	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
533	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
534	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
536	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
537	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
539	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
540	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
542	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
543	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
545	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
546	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
548	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
549	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
551	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
552	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
554	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
555	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
557	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
558	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
560	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
561	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
563	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
564	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
566	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
567	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
569	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
570	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
572	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
573	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
575	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
576	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
578	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
579	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
581	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
582	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
584	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
585	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
587	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
588	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
590	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
591	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
593	payment_issue	Payment Processing Delay	Booking #1234 payment is experiencing processing delays.	\N	medium	f	2024-03-14 16:20:00	\N
594	review_flagged	Review Flagged for Moderation	A review for Property #567 has been flagged by the host.	\N	low	t	2024-03-13 09:15:00	\N
1	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
4	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
7	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
10	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
13	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
16	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
19	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
22	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
25	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
28	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
31	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
34	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
37	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
40	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
43	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
46	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
49	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
52	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
55	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
58	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
61	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
64	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
67	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
70	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
73	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
76	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
79	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
82	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
85	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
88	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
91	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
94	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
97	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
100	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
103	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
106	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
109	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
112	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
115	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
118	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
121	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
124	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
127	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
130	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
133	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
136	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
139	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
142	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
145	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
148	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
151	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
154	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
157	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
160	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
163	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
166	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
169	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
172	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
175	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
178	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
181	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
184	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
187	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
190	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
193	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
196	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
199	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
202	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
205	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
208	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
211	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
214	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
217	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
220	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
223	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
226	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
229	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
232	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
235	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
238	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
241	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
244	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
247	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
250	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
253	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
256	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
259	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
262	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
265	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
268	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
271	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
274	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
277	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
280	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
283	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
286	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
289	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
292	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
295	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
298	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
301	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
304	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
307	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
310	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
313	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
316	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
319	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
322	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
325	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
328	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
331	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
334	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
337	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
340	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
343	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
346	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
349	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
352	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
355	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
358	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
361	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
364	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
367	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
370	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
373	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
376	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
379	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
382	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
385	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
388	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
391	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
394	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
397	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
400	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
403	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
406	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
409	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
412	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
415	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
418	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
421	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
424	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
427	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
430	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
433	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
436	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
439	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
442	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
445	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
448	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
451	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
454	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
457	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
460	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
463	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
466	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
469	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
472	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
475	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
478	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
481	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
484	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
487	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
490	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
493	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
496	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
499	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
502	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
505	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
508	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
511	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
514	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
517	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
520	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
523	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
526	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
529	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
532	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
535	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
538	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
541	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
544	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
547	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
550	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
553	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
556	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
559	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
562	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
565	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
568	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
571	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
574	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
577	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
580	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
583	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
586	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
589	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
592	host_verification	New Host Verification Pending	Sarah NewHost has submitted verification documents for review.	\N	high	f	2024-03-15 10:30:00	\N
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.bookings (id, property_id, guest_id, host_id, check_in, check_out, check_in_time, check_out_time, booking_type, guests, total_amount, status, payment_status, special_requests, metadata, created_at, updated_at) FROM stdin;
3	12	6	8	2026-04-27 00:00:00+08	2026-04-29 00:00:00+08	15:00	11:00	fixed	1	1200.00	confirmed	paid		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-05-02 04:54:22.113339	2026-04-30 02:25:40.568893
4	12	6	8	2026-04-30 00:00:00+08	2026-05-01 00:00:00+08	15:00	11:00	fixed	5	900.00	completed	partial	Non	{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 1, "selectedDuration": null, "extraGuestFeeTotal": 300, "extraGuestFeePerNight": 300}	2026-04-30 20:10:43.931521	2026-05-02 04:27:25.766608
5	12	6	8	2026-05-01 00:00:00+08	2026-05-02 00:00:00+08	15:00	11:00	fixed	3	600.00	completed	pending	432432	{"email": "ryevincent99@gmail.com", "phone": "34432432", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "checkoutPhotos": ["https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666967/smartstay/checkout/5/tektq1l1wv19yerlq8wk.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666968/smartstay/checkout/5/cgt4gk07unubowdvvmkv.png"], "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "checkoutSubmittedAt": "2026-05-01T20:22:47.517Z", "extraGuestFeePerNight": 300}	2026-04-29 11:27:05.749702	2026-05-02 04:24:11.050304
12	12	6	8	2026-05-22 00:00:00+08	2026-05-23 00:00:00+08	15:00	11:00	fixed	1	600.00	pending	paid		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-21 07:05:16.658793	2026-05-03 06:10:58.608124
13	12	6	8	2026-05-27 00:00:00+08	2026-05-28 00:00:00+08	15:00	11:00	fixed	1	600.00	pending	pending		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-19 22:21:38.476975	2026-05-01 22:40:31.216698
14	12	6	8	2026-05-28 00:00:00+08	2026-05-29 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	pending		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-18 13:38:00.295157	2026-05-03 06:14:19.710393
15	12	6	8	2026-05-29 00:00:00+08	2026-05-30 00:00:00+08	15:00	11:00	fixed	1	600.00	confirmed	pending		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-17 04:54:22.113339	2026-05-03 06:14:18.432351
16	12	6	8	2026-05-19 00:00:00+08	2026-05-20 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	paid		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 0, "cancelledAt": "2026-05-02T11:36:28.106Z", "cancelledBy": "guest", "refundAmount": 0, "refundPercentage": 100, "hoursBeforeCheckIn": 388.4}, "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-15 20:10:43.931521	2026-05-03 06:10:14.397682
17	12	6	8	2026-05-20 00:00:00+08	2026-05-21 00:00:00+08	15:00	11:00	fixed	1	600.00	confirmed	paid		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-14 11:27:05.749702	2026-05-03 06:09:15.801012
6	12	6	8	2026-05-02 00:00:00+08	2026-05-03 00:00:00+08	15:00	11:00	fixed	1	600.00	confirmed	pending		{"email": "ryevincent99@gmail.com", "phone": "98", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-28 02:43:27.567884	2026-04-30 02:32:18.168334
7	12	6	8	2026-05-03 00:00:00+08	2026-05-04 00:00:00+08	15:00	11:00	fixed	5	900.00	pending	pending		{"email": "ryevincent99@gmail.com", "phone": "23", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 1, "selectedDuration": null, "extraGuestFeeTotal": 300, "extraGuestFeePerNight": 300}	2026-04-26 17:59:49.386066	2026-04-30 02:38:31.381092
8	12	6	8	2026-05-04 00:00:00+08	2026-05-05 00:00:00+08	15:00	11:00	fixed	1	600.00	confirmed	pending		{"email": "ryevincent99@gmail.com", "phone": "432", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-25 09:16:11.204248	2026-04-30 02:40:53.847799
10	12	6	8	2026-05-14 00:00:00+08	2026-05-15 00:00:00+08	15:00	11:00	fixed	1	600.00	pending	pending	432432	{"email": "ryevincent99@gmail.com", "phone": "342432342", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-24 00:32:33.02243	2026-05-01 22:20:15.785942
11	12	6	8	2026-05-15 00:00:00+08	2026-05-16 00:00:00+08	15:00	11:00	fixed	1	600.00	pending	pending	oiygevhjh	{"email": "ryevincent99@gmail.com", "phone": "092386587", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-22 15:48:54.840612	2026-05-01 22:30:59.296079
18	12	6	8	2026-06-16 00:00:00+08	2026-06-17 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	pending		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 0, "cancelledAt": "2026-05-02T14:23:19.767Z", "cancelledBy": "guest", "refundAmount": 0, "refundPercentage": 100, "hoursBeforeCheckIn": 1057.6}, "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-13 02:43:27.567884	2026-05-02 22:23:19.769212
19	12	6	8	2026-05-12 00:00:00+08	2026-05-13 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	refunded		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 180, "cancelledAt": "2026-05-02T11:32:36.929Z", "cancelledBy": "guest", "refundAmount": 180, "refundPercentage": 100, "hoursBeforeCheckIn": 220.5}, "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-11 17:59:49.386066	2026-05-02 19:32:36.933794
20	12	6	8	2026-05-25 00:00:00+08	2026-05-26 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	refunded		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 180, "cancelledAt": "2026-05-02T11:31:04.153Z", "cancelledBy": "guest", "refundAmount": 180, "refundPercentage": 100, "hoursBeforeCheckIn": 532.5}, "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-10 09:16:11.204248	2026-05-02 19:31:04.160129
21	12	6	8	2026-05-05 00:00:00+08	2026-05-06 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	paid		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 600, "cancelledAt": "2026-05-02T11:29:52.721Z", "cancelledBy": "guest", "refundAmount": 600, "refundPercentage": 100, "hoursBeforeCheckIn": 52.5}, "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-09 00:32:33.02243	2026-05-02 19:29:52.725239
22	12	6	8	2026-06-12 00:00:00+08	2026-06-13 00:00:00+08	15:00	11:00	fixed	1	600.00	cancelled	paid		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 600, "cancelledAt": "2026-05-02T11:26:45.573Z", "cancelledBy": "guest", "refundAmount": 600, "refundPercentage": 100, "hoursBeforeCheckIn": 964.6}, "durationHours": null, "checkoutPhotos": ["https://res.cloudinary.com/dwo9nknqz/image/upload/v1777719247/smartstay/checkout/22/hxc46stzgu2wq0ixrsgj.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777719248/smartstay/checkout/22/ldzhp022kpsrm9ogobjn.png"], "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "checkoutSubmittedAt": "2026-05-02T10:54:07.690Z", "extraGuestFeePerNight": 300}	2026-04-07 15:48:54.840612	2026-05-02 19:26:45.576044
23	12	6	8	2026-05-06 00:00:00+08	2026-05-07 00:00:00+08	15:00	11:00	fixed	1	300.00	cancelled	refunded		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "promoCode": "SUMMERDAY", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 300, "cancelledAt": "2026-05-02T11:31:19.884Z", "cancelledBy": "guest", "refundAmount": 300, "refundPercentage": 100, "hoursBeforeCheckIn": 76.5}, "durationHours": null, "discountAmount": 300, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-06 07:05:16.658793	2026-05-02 19:31:19.888582
25	12	6	8	2026-05-07 00:00:00+08	2026-05-08 00:00:00+08	15:00	11:00	fixed	1	300.00	cancelled	refunded		{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "promoCode": "SUMMERDAY", "cancellation": {"policy": "Full refund (48+ hours notice)", "totalPaid": 300, "cancelledAt": "2026-05-02T11:33:31.611Z", "cancelledBy": "guest", "refundAmount": 300, "refundPercentage": 100, "hoursBeforeCheckIn": 100.4}, "durationHours": null, "checkoutPhotos": ["https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666401/smartstay/checkout/25/wp3mnvrfw0phjd7fjhvk.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666401/smartstay/checkout/25/octfaqccd7ovgwhcqmpp.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666424/smartstay/checkout/25/rbilhrdlq2gydoagfsew.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666424/smartstay/checkout/25/r2fa6thfstwqw1muiys7.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666489/smartstay/checkout/25/tfwhnmpqzndwfcwlkxus.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666489/smartstay/checkout/25/eenukvfeq4xqjsnhhibg.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666945/smartstay/checkout/25/uhzjkhm1xngdzi4mojuo.png", "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777666945/smartstay/checkout/25/q8bhyaon5pcwsdsbluan.png"], "discountAmount": 300, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "checkoutSubmittedAt": "2026-05-01T20:22:24.928Z", "extraGuestFeePerNight": 300}	2026-04-04 22:21:38.476975	2026-05-02 19:33:31.622891
26	923	6	8	2026-05-02 00:00:00+08	2026-05-09 00:00:00+08	15:00	11:00	fixed	1	10500.00	confirmed	paid	wowser	{"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "photoUrl": "https://res.cloudinary.com/dwo9nknqz/image/upload/v1777726905/smartstay/properties/6/property_1777726903368_458259.jpg", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}	2026-04-03 13:38:00.295157	2026-05-02 21:02:57.153447
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, session_id, sender, message, created_at) FROM stdin;
1	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	user	Hello	2026-04-30 17:44:07.337633
2	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	bot	Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.	2026-04-30 17:44:07.342138
3	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	user	available dates for april 30	2026-04-30 17:55:34.282706
4	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	bot	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-04-30 17:55:34.285411
5	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	View payment status	2026-05-02 23:07:21.050199
6	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:07:21.053622
7	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:07:35.247915
8	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:07:35.252317
9	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Browse properties	2026-05-02 23:07:40.611158
10	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	Browse our available properties in the "Units" section. You can filter by location, price, amenities, and more to find your perfect stay!	2026-05-02 23:07:40.615629
11	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	properties	2026-05-02 23:08:15.912078
12	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:08:15.916415
13	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	account questions	2026-05-02 23:08:24.046975
14	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:08:24.049043
15	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:09:21.749212
16	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:09:21.752389
17	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Help with account	2026-05-02 23:10:33.238481
18	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:10:33.241991
19	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	View payment status	2026-05-02 23:10:38.603208
20	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You don't have any payment records yet. Payments will appear here after you make a booking.	2026-05-02 23:10:38.604501
21	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:16:33.510513
22	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:33.51488
23	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:16:34.626554
24	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:34.628822
25	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:16:35.063196
26	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:35.0642
27	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:16:35.208418
28	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:35.209338
29	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	View payment status	2026-05-02 23:16:35.512846
30	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:16:35.514505
31	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	View payment status	2026-05-02 23:16:35.660895
32	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:16:35.661598
33	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Check my bookings	2026-05-02 23:16:35.952639
34	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:35.953146
35	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Check my bookings	2026-05-02 23:16:36.12578
36	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:36.126579
37	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Check my bookings	2026-05-02 23:16:36.514781
38	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:36.516824
39	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Check my bookings	2026-05-02 23:16:36.820762
40	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:36.823303
41	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	View payment status	2026-05-02 23:16:41.277036
42	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:16:41.277658
43	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	My bookings	2026-05-02 23:17:06.22718
44	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You currently have 23 booking(s) in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-02 23:17:06.231584
45	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Verification status	2026-05-02 23:17:18.254943
46	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	Your verification status is: verified.	2026-05-02 23:17:18.256628
47	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	View bookings	2026-05-02 23:17:21.133556
48	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 22 booking(s) for your properties: 5 confirmed, 7 pending. Check "Bookings" to manage reservations.	2026-05-02 23:17:21.134669
49	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	View bookings	2026-05-02 23:18:23.344341
99	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	booking please	2026-05-03 18:34:06.944091
50	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 22 booking(s) for your properties: 5 confirmed, 7 pending. Check "Bookings" to manage reservations.	2026-05-02 23:18:23.346516
51	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Check my properties	2026-05-02 23:18:25.139016
52	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	I apologize, but I encountered an error processing your request. Please try again.	2026-05-02 23:18:25.142366
53	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Check payouts	2026-05-02 23:21:44.559313
54	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 15 payout(s) with ₱4301278.00 completed. Visit "Payouts" for detailed transaction history.	2026-05-02 23:21:44.562036
55	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Check my properties	2026-05-02 23:22:04.334743
56	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 2 propert(ies): 2 available for booking. Visit "My Properties" to manage listings, pricing, and availability.	2026-05-02 23:22:04.337556
57	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Check my bookings	2026-05-02 23:22:29.957952
58	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:22:29.959193
59	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	View payment status	2026-05-02 23:22:32.625478
60	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:22:32.627186
61	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Browse properties	2026-05-02 23:22:37.063233
62	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	Browse our available properties in the "Units" section. You can filter by location, price, amenities, and more to find your perfect stay!	2026-05-02 23:22:37.065527
63	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Help with account	2026-05-02 23:22:40.292014
64	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:22:40.292752
65	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Profile Settings	2026-05-02 23:22:48.788812
66	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:22:48.790981
67	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Check my properties	2026-05-02 23:22:55.807974
68	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 2 properties: 2 available for booking. Visit "My Properties" to manage listings, pricing, and availability.	2026-05-02 23:22:55.809534
69	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Verification status	2026-05-02 23:24:29.442897
70	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	Your verification status is: verified.	2026-05-02 23:24:29.445672
71	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Get support	2026-05-02 23:27:00.113234
72	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I'm here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?	2026-05-02 23:27:00.118098
73	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Booking issues	2026-05-02 23:28:09.569091
74	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You currently have 23 bookings in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-02 23:28:09.573136
75	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Problems with reservations	2026-05-02 23:28:15.890946
76	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:28:15.891815
77	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Get support	2026-05-02 23:29:32.480134
78	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I'm here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?	2026-05-02 23:29:32.485395
79	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Booking issues	2026-05-02 23:29:36.586892
80	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I can help with booking issues:\n• Pending bookings - Waiting for host confirmation\n• Payment problems - Failed or pending payments\n• Booking modifications - Date changes not allowed after confirmation\n• Cancellations - Check refund policy (100% refund 48+ hours before, 50% for 24-48 hours, no refund <24 hours)\n\nWhich issue are you experiencing?	2026-05-02 23:29:36.589283
81	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Pending bookings	2026-05-02 23:29:51.125288
82	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	You currently have 23 bookings in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-02 23:29:51.128951
83	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	Failed or pending payments	2026-05-02 23:29:59.787294
84	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I found 23 payment records linked to your account. Tell me if you want help with pending, completed, or failed payments.	2026-05-02 23:29:59.789201
85	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	user	failed payments.	2026-05-02 23:30:10.188498
86	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	bot	I found 23 payment records linked to your account. Tell me if you want help with pending, completed, or failed payments.	2026-05-02 23:30:10.192796
87	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	user	Get support	2026-05-03 05:13:02.316196
88	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	bot	I'm here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?	2026-05-03 05:13:02.3283
89	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	user	hi	2026-05-03 05:13:06.302235
90	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	bot	Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.	2026-05-03 05:13:06.302846
91	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	user	View bookings	2026-05-03 05:56:49.230589
92	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	bot	You have 22 bookings for your properties: 5 confirmed, 7 pending. Check "Bookings" to manage reservations.	2026-05-03 05:56:49.234428
93	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	View payment status	2026-05-03 12:40:10.759229
94	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 23 payments: 16 completed, 3 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-03 12:40:10.771377
95	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	Check my bookings	2026-05-03 18:33:31.123331
96	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You have 22 bookings: 6 confirmed, 5 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-03 18:33:31.133614
97	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	hello	2026-05-03 18:34:02.113963
98	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.	2026-05-03 18:34:02.116638
100	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	You currently have 22 bookings in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-03 18:34:06.946486
101	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	user	hey hey	2026-05-03 18:34:10.053987
102	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	bot	Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.	2026-05-03 18:34:10.056178
105	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	admin	hello po	2026-05-03 18:39:41.160299
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_sessions (id, session_id, user_id, started_at, ended_at, message_count, resolved, feedback, escalated, escalated_at, admin_joined, admin_id, resolution_notes) FROM stdin;
1	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	2026-05-02 23:07:21.050199	2026-05-02 23:30:10.192796	62	t	none	f	\N	f	\N	\N
2	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	8	2026-04-30 17:44:07.337633	2026-05-03 05:56:49.234428	10	t	none	f	\N	f	\N	\N
3	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	6	2026-05-03 12:40:10.759229	2026-05-03 18:39:41.168106	31	t	none	f	\N	t	1041	\N
\.


--
-- Data for Name: chatbot_messages_backup; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chatbot_messages_backup (id, session_id, user_id, sender, message, created_at) FROM stdin;
1	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	8	user	Hello	2026-04-30 17:44:07.337633
2	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	8	assistant	Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.	2026-04-30 17:44:07.342138
3	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	6	user	available dates for april 30	2026-04-30 17:55:34.282706
4	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	6	assistant	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-04-30 17:55:34.285411
5	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	View payment status	2026-05-02 23:07:21.050199
6	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:07:21.053622
7	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:07:35.247915
8	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:07:35.252317
9	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Browse properties	2026-05-02 23:07:40.611158
10	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	Browse our available properties in the "Units" section. You can filter by location, price, amenities, and more to find your perfect stay!	2026-05-02 23:07:40.615629
11	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	properties	2026-05-02 23:08:15.912078
12	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:08:15.916415
13	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	account questions	2026-05-02 23:08:24.046975
14	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:08:24.049043
15	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:09:21.749212
16	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:09:21.752389
17	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Help with account	2026-05-02 23:10:33.238481
18	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:10:33.241991
19	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	View payment status	2026-05-02 23:10:38.603208
20	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	You don't have any payment records yet. Payments will appear here after you make a booking.	2026-05-02 23:10:38.604501
21	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:16:33.510513
22	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:33.51488
23	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:16:34.626554
24	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:34.628822
25	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:16:35.063196
26	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:35.0642
27	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:16:35.208418
28	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:16:35.209338
29	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	View payment status	2026-05-02 23:16:35.512846
30	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:16:35.514505
31	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	View payment status	2026-05-02 23:16:35.660895
32	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:16:35.661598
33	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Check my bookings	2026-05-02 23:16:35.952639
34	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:35.953146
35	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Check my bookings	2026-05-02 23:16:36.12578
36	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:36.126579
37	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Check my bookings	2026-05-02 23:16:36.514781
38	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:36.516824
39	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Check my bookings	2026-05-02 23:16:36.820762
40	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:16:36.823303
41	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	View payment status	2026-05-02 23:16:41.277036
42	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:16:41.277658
43	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	My bookings	2026-05-02 23:17:06.22718
44	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You currently have 23 booking(s) in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-02 23:17:06.231584
45	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Verification status	2026-05-02 23:17:18.254943
46	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	Your verification status is: verified.	2026-05-02 23:17:18.256628
47	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	View bookings	2026-05-02 23:17:21.133556
48	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	You have 22 booking(s) for your properties: 5 confirmed, 7 pending. Check "Bookings" to manage reservations.	2026-05-02 23:17:21.134669
49	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	View bookings	2026-05-02 23:18:23.344341
50	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	You have 22 booking(s) for your properties: 5 confirmed, 7 pending. Check "Bookings" to manage reservations.	2026-05-02 23:18:23.346516
51	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Check my properties	2026-05-02 23:18:25.139016
52	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	I apologize, but I encountered an error processing your request. Please try again.	2026-05-02 23:18:25.142366
53	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Check payouts	2026-05-02 23:21:44.559313
54	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	You have 15 payout(s) with ₱4301278.00 completed. Visit "Payouts" for detailed transaction history.	2026-05-02 23:21:44.562036
55	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Check my properties	2026-05-02 23:22:04.334743
56	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	You have 2 propert(ies): 2 available for booking. Visit "My Properties" to manage listings, pricing, and availability.	2026-05-02 23:22:04.337556
57	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Check my bookings	2026-05-02 23:22:29.957952
58	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 booking(s): 5 confirmed, 8 pending. Visit "My Bookings" to view details, make payments, or manage your reservations.	2026-05-02 23:22:29.959193
59	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	View payment status	2026-05-02 23:22:32.625478
60	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You have 23 payment(s): 13 completed, 6 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-02 23:22:32.627186
61	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Browse properties	2026-05-02 23:22:37.063233
62	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	Browse our available properties in the "Units" section. You can filter by location, price, amenities, and more to find your perfect stay!	2026-05-02 23:22:37.065527
63	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Help with account	2026-05-02 23:22:40.292014
64	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with:\n• Profile settings - Update your personal information\n• Password changes - Secure your account\n• Notification preferences - Manage alerts\n• Privacy settings - Control your data\n\nWhat would you like to do?	2026-05-02 23:22:40.292752
65	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Profile Settings	2026-05-02 23:22:48.788812
66	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:22:48.790981
67	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Check my properties	2026-05-02 23:22:55.807974
68	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	You have 2 properties: 2 available for booking. Visit "My Properties" to manage listings, pricing, and availability.	2026-05-02 23:22:55.809534
69	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	user	Verification status	2026-05-02 23:24:29.442897
70	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	8	assistant	Your verification status is: verified.	2026-05-02 23:24:29.445672
71	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Get support	2026-05-02 23:27:00.113234
72	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I'm here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?	2026-05-02 23:27:00.118098
73	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Booking issues	2026-05-02 23:28:09.569091
74	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You currently have 23 bookings in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-02 23:28:09.573136
75	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Problems with reservations	2026-05-02 23:28:15.890946
76	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help you with bookings, payments, properties, and account questions. Tell me what you need and I will guide you step by step.	2026-05-02 23:28:15.891815
77	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Get support	2026-05-02 23:29:32.480134
78	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I'm here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?	2026-05-02 23:29:32.485395
79	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Booking issues	2026-05-02 23:29:36.586892
80	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I can help with booking issues:\n• Pending bookings - Waiting for host confirmation\n• Payment problems - Failed or pending payments\n• Booking modifications - Date changes not allowed after confirmation\n• Cancellations - Check refund policy (100% refund 48+ hours before, 50% for 24-48 hours, no refund <24 hours)\n\nWhich issue are you experiencing?	2026-05-02 23:29:36.589283
81	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Pending bookings	2026-05-02 23:29:51.125288
82	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	You currently have 23 bookings in Smart Stay. I can help you check booking details, status, or payment next.	2026-05-02 23:29:51.128951
83	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	Failed or pending payments	2026-05-02 23:29:59.787294
84	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I found 23 payment records linked to your account. Tell me if you want help with pending, completed, or failed payments.	2026-05-02 23:29:59.789201
85	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	user	failed payments.	2026-05-02 23:30:10.188498
86	3nzcgIv1UakilH83cUa7KrKeOfvXZqpN	6	assistant	I found 23 payment records linked to your account. Tell me if you want help with pending, completed, or failed payments.	2026-05-02 23:30:10.192796
87	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	6	user	Get support	2026-05-03 05:13:02.316196
88	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	6	assistant	I'm here to help! Common topics:\n• Booking issues - Problems with reservations\n• Payment questions - GCash, Maya, Card payments\n• Property inquiries - Questions about listings\n• Account settings - Profile and preferences\n• Cancellation policy - Refund information\n\nWhat do you need help with?	2026-05-03 05:13:02.3283
89	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	6	user	hi	2026-05-03 05:13:06.302235
90	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	6	assistant	Hello! I am your Smart Stay assistant. Ask me about bookings, payments, host verification, or account help.	2026-05-03 05:13:06.302846
91	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	8	user	View bookings	2026-05-03 05:56:49.230589
92	uzLprMxWzN-31scZqEs9QVkduxkHb0Rk	8	assistant	You have 22 bookings for your properties: 5 confirmed, 7 pending. Check "Bookings" to manage reservations.	2026-05-03 05:56:49.234428
93	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	6	user	View payment status	2026-05-03 12:40:10.759229
94	5SLI82UMfxIoYO5O318MN75sMoDo7zU7	6	assistant	You have 23 payments: 16 completed, 3 pending. Check "My Bookings" > "Payment History" tab for full details.	2026-05-03 12:40:10.771377
\.


--
-- Data for Name: chatbot_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chatbot_settings (id, enabled, welcome_message, fallback_message, response_delay, created_at, updated_at) FROM stdin;
1	t	Hello! I'm your smart assistant. How can I help you today?	I'm not sure I understand that. Could you rephrase that?	3000	2026-05-03 17:56:45.279926	2026-05-03 17:56:45.279926
\.


--
-- Data for Name: communication_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.communication_settings (id, email_notifications, message_alerts, chatbot_alerts, auto_response, response_time_hours, max_concurrent_chats, created_at, updated_at) FROM stdin;
1	t	t	f	t	2	10	2026-05-03 18:13:59.175657	2026-05-03 18:13:59.175657
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_messages (id, name, email, subject, message, status, replied_at, reply_message, created_at) FROM stdin;
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.disputes (id, booking_id, guest_id, host_id, issue, priority, status, resolution, created_at, updated_at, resolved_at, resolved_by) FROM stdin;
\.


--
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faqs (id, question, answer, category, display_order, is_active, created_at, updated_at) FROM stdin;
1	What is SmartStay?	SmartStay is a modern booking platform that connects guests with quality accommodations. We offer a seamless booking experience with secure payments and real-time communication.	general	1	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
2	How do I book a property?	Browse available properties, select your dates, review the details, and click "Book Now". You'll need to create an account and complete the payment process to confirm your booking.	booking	2	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
3	What payment methods do you accept?	We accept GCash, bank transfers, and other digital payment methods. All payments are processed securely through our platform.	payment	3	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
4	Can I cancel my booking?	Yes, you can cancel your booking from your booking history page. Cancellation policies vary by property, so please review the specific terms before booking.	booking	4	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
5	How do I become a host?	Click "Become a Host" in the navigation menu, complete the verification process, and start listing your properties. Our team will review your application within 24-48 hours.	hosting	5	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
6	Is my payment information secure?	Yes, we use industry-standard encryption and secure payment gateways to protect your financial information. We never store your complete payment details.	payment	6	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
7	How do I contact customer support?	You can reach us through the chat feature on our website, send a message through the contact form, or email us directly. We typically respond within 24 hours.	general	7	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
8	What if I have issues with my booking?	Contact the host directly through our messaging system. If the issue isn't resolved, our support team is available to help mediate and find a solution.	booking	8	t	2026-04-30 22:59:55.41974	2026-04-30 22:59:55.41974
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, user_id, property_id, created_at) FROM stdin;
7	6	923	2026-05-02 22:39:01.339223
10	6	12	2026-05-03 13:59:51.931771
\.


--
-- Data for Name: host_expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.host_expenses (id, host_user_id, expense_date, type, description, property, amount, category, created_at) FROM stdin;
7	8	2026-04-27	Cleaning services costs	ghffghfgfhhfg	Trial#1	45000.00	Cleaning services costs	2026-04-27 19:02:57.479549
8	8	2026-04-27	Maintenance costs	oiuiou	Trial#1	980.00	Maintenance costs	2026-04-27 19:03:06.774218
9	8	2026-04-27	Utilities costs	342432	Trial#1	67.00	Utilities costs	2026-04-27 19:11:31.173652
10	8	2026-04-27	Marketing Expenses	675765	Trial#1	55555.00	Marketing Expenses	2026-04-27 19:11:39.53366
11	8	2026-05-02	Supplies and Inventory	asdas	General	123123.00	Supplies and Inventory	2026-05-03 06:07:10.503881
12	8	2026-05-02	Utilities costs	Aa	General	111.00	Utilities costs	2026-05-03 06:09:11.989404
\.


--
-- Data for Name: host_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.host_reviews (id, host_id, guest_id, booking_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: host_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.host_verifications (id, host_user_id, business_name, business_type, business_address, id_type, id_number, tax_id, details, status, rejection_reason, submitted_at, reviewed_at, reviewed_by, created_at, updated_at) FROM stdin;
1	8	SSles	Individual	Pingkian 3, Pingkian Village, Pasong Tamo, 6th District, Quezon City, Eastern Manila District, Metro Manila, 1107, Philippines	Passport	3947697	9074509374	{"email": "", "taxId": "9074509374", "idType": "Passport", "hostName": "", "idNumber": "3947697", "businessName": "SSles", "businessType": "Individual", "businessAddress": "Pingkian 3, Pingkian Village, Pasong Tamo, 6th District, Quezon City, Eastern Manila District, Metro Manila, 1107, Philippines"}	approved		2026-04-07 21:01:37.20783	2026-05-03 16:49:13.033583	1040	2026-04-07 21:01:37.20783	2026-05-03 16:49:13.033583
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, receiver_id, property_id, booking_id, message, is_read, created_at, updated_at, user_id, subject, status, priority, category, replied_at, replied_by, reply_message) FROM stdin;
6	conv_p_12_6_8	6	8	12	\N	Hello po Maam	t	2026-04-27 18:39:53.825066	2026-04-27 18:41:37.021067	\N	\N	unread	normal	general	\N	\N	\N
41	conv_p_12_6_8	8	6	\N	\N	da	t	2026-04-30 17:54:11.699389	2026-04-30 17:57:08.452543	\N	\N	unread	normal	general	\N	\N	\N
7	conv_p_12_6_8	8	6	\N	\N	Hello po Maam Rye Vincent	t	2026-04-27 18:42:54.907356	2026-04-27 18:43:20.270523	\N	\N	unread	normal	general	\N	\N	\N
8	conv_p_12_6_8	6	8	\N	\N	Hello po Sir!	t	2026-04-29 17:39:55.029626	2026-04-29 17:40:00.794411	\N	\N	unread	normal	general	\N	\N	\N
33	conv_p_12_6_8	8	6	\N	\N	as	t	2026-04-30 17:54:10.24053	2026-04-30 17:57:08.449938	\N	\N	unread	normal	general	\N	\N	\N
9	conv_p_12_6_8	8	6	\N	\N	fdbvjhdkjvhdvjk	t	2026-04-29 17:40:42.478952	2026-04-29 17:43:43.493062	\N	\N	unread	normal	general	\N	\N	\N
10	conv_p_12_6_8	6	8	\N	\N	sdadsads	t	2026-04-29 18:02:21.736217	2026-04-29 18:02:46.390835	\N	\N	unread	normal	general	\N	\N	\N
11	conv_p_12_6_8	6	8	\N	\N	dsadsadsa	t	2026-04-29 18:02:40.198514	2026-04-29 18:02:46.392197	\N	\N	unread	normal	general	\N	\N	\N
42	conv_p_12_6_8	8	6	\N	\N	sd	t	2026-04-30 17:54:11.877204	2026-04-30 17:57:08.453874	\N	\N	unread	normal	general	\N	\N	\N
43	conv_p_12_6_8	8	6	\N	\N	as	t	2026-04-30 17:54:12.094454	2026-04-30 17:57:08.455597	\N	\N	unread	normal	general	\N	\N	\N
12	conv_p_12_6_8	8	6	\N	\N	dsadsasda	t	2026-04-29 18:02:48.872706	2026-04-29 18:02:56.109029	\N	\N	unread	normal	general	\N	\N	\N
13	conv_p_12_6_8	8	6	\N	\N	dsadsa	t	2026-04-29 18:02:52.665587	2026-04-29 18:02:56.113185	\N	\N	unread	normal	general	\N	\N	\N
14	conv_p_12_6_8	6	8	\N	\N	dsasdadsasdasd	t	2026-04-29 18:07:57.792743	2026-04-29 18:08:02.86473	\N	\N	unread	normal	general	\N	\N	\N
30	conv_p_12_6_8	8	6	\N	\N	asd	t	2026-04-30 17:54:09.52361	2026-04-30 17:57:08.453401	\N	\N	unread	normal	general	\N	\N	\N
15	conv_p_12_6_8	8	6	\N	\N	dsasdadsadsa	t	2026-04-29 18:08:12.125796	2026-04-29 18:11:55.488444	\N	\N	unread	normal	general	\N	\N	\N
16	conv_p_12_6_8	6	8	\N	\N	dsasdadsadsa	t	2026-04-29 18:11:59.97506	2026-04-29 18:14:08.931035	\N	\N	unread	normal	general	\N	\N	\N
17	conv_p_12_6_8	6	8	\N	\N	dsadsasda	t	2026-04-29 18:13:11.969491	2026-04-29 18:14:08.932506	\N	\N	unread	normal	general	\N	\N	\N
44	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:12.950898	2026-04-30 17:57:08.457643	\N	\N	unread	normal	general	\N	\N	\N
18	conv_p_12_6_8	8	6	\N	\N	dsadsadsads	t	2026-04-29 18:14:14.80042	2026-04-29 18:14:36.667946	\N	\N	unread	normal	general	\N	\N	\N
19	conv_p_12_6_8	6	8	\N	\N	dsadsasda	t	2026-04-29 18:14:38.344301	2026-04-29 18:20:43.050156	\N	\N	unread	normal	general	\N	\N	\N
20	conv_p_12_6_8	6	8	\N	\N	hello bossing	t	2026-04-30 02:15:48.271697	2026-04-30 02:15:54.159991	\N	\N	unread	normal	general	\N	\N	\N
21	conv_p_12_6_8	6	8	\N	\N	sdadsasda	t	2026-04-30 17:38:15.41087	2026-04-30 17:38:51.051592	\N	\N	unread	normal	general	\N	\N	\N
22	conv_p_12_6_8	6	8	\N	\N	hi p[o	t	2026-04-30 17:38:33.672607	2026-04-30 17:38:51.052322	\N	\N	unread	normal	general	\N	\N	\N
31	conv_p_12_6_8	8	6	\N	\N	asd	t	2026-04-30 17:54:09.782625	2026-04-30 17:57:08.454974	\N	\N	unread	normal	general	\N	\N	\N
23	conv_p_12_6_8	8	6	\N	\N	helklo	t	2026-04-30 17:38:56.737381	2026-04-30 17:38:59.07685	\N	\N	unread	normal	general	\N	\N	\N
45	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:13.150161	2026-04-30 17:57:08.457801	\N	\N	unread	normal	general	\N	\N	\N
24	conv_p_12_6_8	8	6	\N	\N	o	t	2026-04-30 17:39:10.078237	2026-04-30 17:39:19.799153	\N	\N	unread	normal	general	\N	\N	\N
46	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:13.292767	2026-04-30 17:57:08.459691	\N	\N	unread	normal	general	\N	\N	\N
25	conv_p_12_6_8	8	6	\N	\N	sa	t	2026-04-30 17:39:16.994221	2026-04-30 17:39:19.834519	\N	\N	unread	normal	general	\N	\N	\N
26	conv_p_12_6_8	8	6	\N	\N	hi	t	2026-04-30 17:54:06.964079	2026-04-30 17:57:08.427765	\N	\N	unread	normal	general	\N	\N	\N
47	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:13.465307	2026-04-30 17:57:08.462875	\N	\N	unread	normal	general	\N	\N	\N
28	conv_p_12_6_8	8	6	\N	\N	dasd	t	2026-04-30 17:54:08.961282	2026-04-30 17:57:08.431694	\N	\N	unread	normal	general	\N	\N	\N
48	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:13.653316	2026-04-30 17:57:08.463079	\N	\N	unread	normal	general	\N	\N	\N
54	conv_p_12_6_8	8	6	\N	\N	pabili yello	t	2026-05-02 21:37:26.356972	2026-05-02 21:37:26.399488	\N	\N	unread	normal	general	\N	\N	\N
27	conv_p_12_6_8	8	6	\N	\N	asdasdas	t	2026-04-30 17:54:08.583945	2026-04-30 17:57:08.433356	\N	\N	unread	normal	general	\N	\N	\N
32	conv_p_12_6_8	8	6	\N	\N	asd	t	2026-04-30 17:54:10.033433	2026-04-30 17:57:08.439481	\N	\N	unread	normal	general	\N	\N	\N
68	conv_p_12_6_8	6	8	\N	\N	hey	t	2026-05-02 21:43:49.966907	2026-05-02 21:43:49.98825	\N	\N	unread	normal	general	\N	\N	\N
29	conv_p_12_6_8	8	6	\N	\N	asd	t	2026-04-30 17:54:09.271709	2026-04-30 17:57:08.439219	\N	\N	unread	normal	general	\N	\N	\N
34	conv_p_12_6_8	8	6	\N	\N	da	t	2026-04-30 17:54:10.436663	2026-04-30 17:57:08.442962	\N	\N	unread	normal	general	\N	\N	\N
35	conv_p_12_6_8	8	6	\N	\N	sd	t	2026-04-30 17:54:10.628124	2026-04-30 17:57:08.444495	\N	\N	unread	normal	general	\N	\N	\N
36	conv_p_12_6_8	8	6	\N	\N	asd	t	2026-04-30 17:54:10.804401	2026-04-30 17:57:08.446112	\N	\N	unread	normal	general	\N	\N	\N
37	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:10.98004	2026-04-30 17:57:08.447393	\N	\N	unread	normal	general	\N	\N	\N
38	conv_p_12_6_8	8	6	\N	\N	d	t	2026-04-30 17:54:11.159717	2026-04-30 17:57:08.448682	\N	\N	unread	normal	general	\N	\N	\N
39	conv_p_12_6_8	8	6	\N	\N	asd	t	2026-04-30 17:54:11.34766	2026-04-30 17:57:08.449818	\N	\N	unread	normal	general	\N	\N	\N
62	conv_p_12_6_8	8	6	\N	\N	kamykah	t	2026-05-02 21:42:49.886513	2026-05-02 21:42:49.940559	\N	\N	unread	normal	general	\N	\N	\N
49	conv_p_12_6_8	8	6	\N	\N	a	t	2026-04-30 17:54:13.826189	2026-04-30 17:57:08.46542	\N	\N	unread	normal	general	\N	\N	\N
40	conv_p_12_6_8	8	6	\N	\N	as	t	2026-04-30 17:54:11.528334	2026-04-30 17:57:08.465637	\N	\N	unread	normal	general	\N	\N	\N
51	conv_p_12_6_8	6	8	\N	\N	ate pabili yelo po	t	2026-05-02 21:27:40.327839	2026-05-02 21:27:45.21364	\N	\N	unread	normal	general	\N	\N	\N
55	conv_p_12_6_8	8	6	\N	\N	nc one	t	2026-05-02 21:37:28.284317	2026-05-02 21:37:28.322387	\N	\N	unread	normal	general	\N	\N	\N
53	conv_p_12_6_8	8	6	\N	\N	heeyyy	t	2026-05-02 21:37:21.941021	2026-05-02 21:37:22.027203	\N	\N	unread	normal	general	\N	\N	\N
59	conv_p_12_6_8	6	8	\N	\N	veryo good very good	t	2026-05-02 21:41:38.476413	2026-05-02 21:41:38.50494	\N	\N	unread	normal	general	\N	\N	\N
56	conv_p_12_6_8	8	6	\N	\N	owemji	t	2026-05-02 21:37:30.299909	2026-05-02 21:37:30.337007	\N	\N	unread	normal	general	\N	\N	\N
60	conv_p_12_6_8	6	8	\N	\N	whow how	t	2026-05-02 21:41:41.564231	2026-05-02 21:41:41.601671	\N	\N	unread	normal	general	\N	\N	\N
57	conv_p_12_6_8	8	6	\N	\N	good job	t	2026-05-02 21:37:31.903238	2026-05-02 21:37:31.942965	\N	\N	unread	normal	general	\N	\N	\N
52	conv_p_12_6_8	8	6	\N	\N	helloo	t	2026-05-02 21:34:43.784727	2026-05-02 21:38:21.020896	\N	\N	unread	normal	general	\N	\N	\N
65	conv_p_12_6_8	8	6	\N	\N	paraluman	t	2026-05-02 21:42:53.575438	2026-05-02 21:42:53.613335	\N	\N	unread	normal	general	\N	\N	\N
63	conv_p_12_6_8	8	6	\N	\N	mno	t	2026-05-02 21:42:50.810613	2026-05-02 21:42:50.848528	\N	\N	unread	normal	general	\N	\N	\N
58	conv_p_12_6_8	8	6	\N	\N	hey hey	t	2026-05-02 21:41:32.148046	2026-05-02 21:41:32.207934	\N	\N	unread	normal	general	\N	\N	\N
61	conv_p_12_6_8	6	8	\N	\N	oshs	t	2026-05-02 21:41:43.709545	2026-05-02 21:41:43.741645	\N	\N	unread	normal	general	\N	\N	\N
66	conv_p_12_6_8	8	6	\N	\N	hey	t	2026-05-02 21:43:44.695038	2026-05-02 21:43:44.711374	\N	\N	unread	normal	general	\N	\N	\N
64	conv_p_12_6_8	8	6	\N	\N	si	t	2026-05-02 21:42:51.576561	2026-05-02 21:42:51.631388	\N	\N	unread	normal	general	\N	\N	\N
67	conv_p_12_6_8	6	8	\N	\N	wazzur	t	2026-05-02 21:43:48.057182	2026-05-02 21:43:48.075078	\N	\N	unread	normal	general	\N	\N	\N
69	conv_p_12_6_8	6	8	\N	\N	hey	t	2026-05-02 21:43:50.7287	2026-05-02 21:43:50.748885	\N	\N	unread	normal	general	\N	\N	\N
70	conv_p_12_6_8	6	8	\N	\N	kamusta	t	2026-05-02 21:43:52.775945	2026-05-02 21:43:52.7944	\N	\N	unread	normal	general	\N	\N	\N
71	conv_p_12_6_8	6	8	\N	\N	ka	t	2026-05-02 21:43:53.319475	2026-05-02 21:43:53.34138	\N	\N	unread	normal	general	\N	\N	\N
72	conv_p_12_6_8	6	8	\N	\N	naman	t	2026-05-02 21:43:54.169018	2026-05-02 21:43:54.193746	\N	\N	unread	normal	general	\N	\N	\N
73	conv_p_12_6_8	6	8	\N	\N	pre	t	2026-05-02 21:43:54.744104	2026-05-02 21:43:54.7655	\N	\N	unread	normal	general	\N	\N	\N
74	conv_p_12_6_8	6	8	\N	\N	hotdog ah	t	2026-05-02 21:43:56.708371	2026-05-02 21:43:56.730398	\N	\N	unread	normal	general	\N	\N	\N
82	conv_p_12_6_8	8	6	\N	\N	aa	t	2026-05-03 06:06:54.277371	2026-05-03 12:45:15.525102	\N	\N	unread	normal	general	\N	\N	\N
83	conv_p_12_6_8	8	6	\N	\N	d	t	2026-05-03 06:06:55.381851	2026-05-03 12:45:15.526013	\N	\N	unread	normal	general	\N	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payments (id, booking_id, payer_user_id, host_id, amount, currency, status, payment_method, transaction_id, reference_number, processing_fee, host_payout, metadata, created_at, completed_at) FROM stdin;
1	1	6	8	3423424.00	PHP	completed	gcash	rewrew432	rewrew432	102702.72	3320721.28	{}	2026-05-02 06:19:44.655142	2026-05-02 06:19:44.655142
2	2	6	8	864684.00	PHP	completed	gcash	543543453	543543453	25940.52	838743.48	{}	2026-04-30 23:01:29.002968	2026-04-30 23:01:29.002968
3	3	6	8	1200.00	PHP	completed	gcash	48574857	48574857	36.00	1164.00	{}	2026-04-29 15:43:13.350794	2026-04-29 15:43:13.350794
4	4	6	8	270.00	PHP	completed	gcash	657	657	8.10	261.90	{}	2026-04-28 08:24:57.69862	2026-04-28 08:24:57.69862
5	8	6	8	180.00	PHP	pending	gcash	5454	5454	5.40	174.60	{}	2026-04-27 01:06:42.046446	2026-04-27 01:06:42.046446
7	999999	6	6	1000.00	PHP	pending	gcash	src_ChjCgMZkxx1KgymsbDTWHPNs	src_ChjCgMZkxx1KgymsbDTWHPNs	30.00	970.00	{"isTest": true, "sourceId": "src_ChjCgMZkxx1KgymsbDTWHPNs", "paymentMethod": "gcash"}	2026-04-24 10:30:10.742099	2026-04-24 10:30:10.742099
8	12	6	8	600.00	PHP	completed	gcash	src_Zp7ftiYRiHEHN8AwgE9zUNnT	src_Zp7ftiYRiHEHN8AwgE9zUNnT	18.00	582.00	{"isTest": false, "sourceId": "src_Zp7ftiYRiHEHN8AwgE9zUNnT", "paymentMethod": "gcash"}	2026-04-23 03:11:55.089925	2026-04-23 03:11:55.089925
9	16	6	8	600.00	PHP	completed	gcash	src_xYtiyoxyDC9zE6qrvZBjvPuS	src_xYtiyoxyDC9zE6qrvZBjvPuS	18.00	582.00	{"isTest": false, "sourceId": "src_xYtiyoxyDC9zE6qrvZBjvPuS", "paymentMethod": "gcash"}	2026-04-21 19:53:39.437751	2026-04-21 19:53:39.437751
10	17	6	8	600.00	PHP	completed	gcash	src_XzPCRiQmhga41WuSqCXUtyGa	src_XzPCRiQmhga41WuSqCXUtyGa	18.00	582.00	{"isTest": false, "sourceId": "src_XzPCRiQmhga41WuSqCXUtyGa", "paymentMethod": "gcash"}	2026-04-20 12:35:23.785577	2026-04-20 12:35:23.785577
11	19	6	8	180.00	PHP	refunded	gcash			5.40	174.60	{"sourceId": null, "paymentIntentId": null}	2026-04-19 05:17:08.133403	2026-04-19 05:17:08.133403
12	20	6	8	180.00	PHP	refunded	grab_pay			5.40	174.60	{"sourceId": null, "paymentIntentId": null}	2026-04-17 21:58:52.481229	2026-04-17 21:58:52.481229
13	999999	6	6	2400.00	PHP	completed	card	pi_CCtGhNp84c9bo5HZk9RVUvHH	pi_CCtGhNp84c9bo5HZk9RVUvHH	72.00	2328.00	{"status": "succeeded", "paymentMethod": "card", "paymentIntentId": "pi_CCtGhNp84c9bo5HZk9RVUvHH", "paymentMethodId": "pm_xnzQUS6Fhmr5CBD43WV8pN3L"}	2026-04-16 14:40:36.829055	2026-04-16 14:40:36.829055
14	999999	6	6	2400.00	PHP	completed	card	pi_n251BgFUcKbVGEtdeA3h7BjW	pi_n251BgFUcKbVGEtdeA3h7BjW	72.00	2328.00	{"status": "succeeded", "paymentMethod": "card", "paymentIntentId": "pi_n251BgFUcKbVGEtdeA3h7BjW", "paymentMethodId": "pm_JBFKGdUuEx2jefYHVZAXhQpu"}	2026-04-15 07:22:21.176881	2026-04-15 07:22:21.176881
15	999999	6	6	2400.00	PHP	completed	card	pi_XZx95YYJGJVHTox9USHE8e8d	pi_XZx95YYJGJVHTox9USHE8e8d	72.00	2328.00	{"status": "succeeded", "paymentMethod": "card", "paymentIntentId": "pi_XZx95YYJGJVHTox9USHE8e8d", "paymentMethodId": "pm_ErBMN9ZDptZhQf3sMJYzQv5K"}	2026-04-14 00:04:05.524707	2026-04-14 00:04:05.524707
16	999999	6	6	3600.00	PHP	completed	card	pi_c1o5GxW9YajgKuR34Lzsvw8Y	pi_c1o5GxW9YajgKuR34Lzsvw8Y	108.00	3492.00	{"status": "succeeded", "paymentMethod": "card", "paymentIntentId": "pi_c1o5GxW9YajgKuR34Lzsvw8Y", "paymentMethodId": "pm_LtMriCZSwAdi8JFEiZKp1skR"}	2026-04-12 16:45:49.872533	2026-04-12 16:45:49.872533
17	999999	6	6	600.00	PHP	completed	card	pi_Mmt9w4vXoinkpqqqg29342hG	pi_Mmt9w4vXoinkpqqqg29342hG	18.00	582.00	{"status": "succeeded", "paymentMethod": "card", "paymentIntentId": "pi_Mmt9w4vXoinkpqqqg29342hG", "paymentMethodId": "pm_QS8fHUtb6NPame1mwSuTEF7N"}	2026-04-11 09:27:34.220359	2026-04-11 09:27:34.220359
18	21	6	8	600.00	PHP	completed	card	pi_Mmt9w4vXoinkpqqqg29342hG	pi_Mmt9w4vXoinkpqqqg29342hG	18.00	582.00	{"paymentMethod": "card", "paymentIntentId": "pi_Mmt9w4vXoinkpqqqg29342hG", "paymentMethodId": "pm_QS8fHUtb6NPame1mwSuTEF7N"}	2026-04-10 02:09:18.568186	2026-04-10 02:09:18.568186
19	22	6	8	600.00	PHP	completed	grab_pay			18.00	582.00	{"sourceId": null, "paymentIntentId": null}	2026-04-08 18:51:02.916012	2026-04-08 18:51:02.916012
20	999999	6	6	300.00	PHP	completed	card	pi_4Sd2kPojPVwUHUEN46DdKZob	pi_4Sd2kPojPVwUHUEN46DdKZob	9.00	291.00	{"status": "succeeded", "paymentMethod": "card", "paymentIntentId": "pi_4Sd2kPojPVwUHUEN46DdKZob", "paymentMethodId": "pm_3HsexaxYQpP9jKx1mbCUUqLt"}	2026-04-07 11:32:47.263838	2026-04-07 11:32:47.263838
21	23	6	8	300.00	PHP	refunded	card	pi_4Sd2kPojPVwUHUEN46DdKZob	pi_4Sd2kPojPVwUHUEN46DdKZob	9.00	291.00	{"paymentMethod": "card", "paymentIntentId": "pi_4Sd2kPojPVwUHUEN46DdKZob", "paymentMethodId": "pm_3HsexaxYQpP9jKx1mbCUUqLt"}	2026-04-06 04:14:31.611664	2026-04-06 04:14:31.611664
22	25	6	8	300.00	PHP	refunded	grab_pay			9.00	291.00	{"sourceId": null, "paymentIntentId": null}	2026-04-04 20:56:15.95949	2026-04-04 20:56:15.95949
23	26	6	8	10500.00	PHP	completed	grab_pay			315.00	10185.00	{"sourceId": null, "paymentIntentId": null}	2026-04-03 13:38:00.307316	2026-04-03 13:38:00.307316
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payouts (id, host_id, amount, currency, status, payout_method, notes, approved_by, approved_at, rejection_reason, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: pending_bookings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pending_bookings (id, pending_id, guest_id, booking_data, created_at, expires_at) FROM stdin;
6	PB-1777658014961-7a46d06c	6	{"guests": 1, "checkIn": "2026-05-29T16:00:00.000Z", "checkOut": "2026-05-30T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 01:53:34.992507	2026-05-02 02:53:34.961
7	PB-1777658237529-ff10f401	6	{"guests": 1, "checkIn": "2026-05-29T16:00:00.000Z", "checkOut": "2026-05-30T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 01:57:17.559022	2026-05-02 02:57:17.529
8	PB-1777658250688-f82a16ed	6	{"guests": 1, "checkIn": "2026-05-29T16:00:00.000Z", "checkOut": "2026-05-30T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 01:57:30.713526	2026-05-02 02:57:30.688
9	PB-1777658359883-66e52bde	6	{"guests": 1, "checkIn": "2026-05-17T16:00:00.000Z", "checkOut": "2026-05-25T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 01:59:20.020733	2026-05-02 02:59:19.883
11	PB-1777658465811-882b0d80	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:01:05.838438	2026-05-02 03:01:05.811
12	PB-1777658560016-86079055	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:02:40.04297	2026-05-02 03:02:40.016
13	PB-1777658624868-c659a25b	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:03:44.871285	2026-05-02 03:03:44.868
14	PB-1777658633313-21af505c	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:03:53.316319	2026-05-02 03:03:53.313
15	PB-1777658685726-53f9abdf	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:04:45.730453	2026-05-02 03:04:45.726
16	PB-1777658719254-9dd640fb	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:05:19.284221	2026-05-02 03:05:19.254
17	PB-1777658766494-58b9339d	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:06:06.49593	2026-05-02 03:06:06.494
18	PB-1777658784183-38cbbbc1	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:06:24.210962	2026-05-02 03:06:24.183
19	PB-1777658866884-f8d1fcbe	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:07:46.912802	2026-05-02 03:07:46.884
20	PB-1777658900419-4a9f8fd0	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:08:20.447423	2026-05-02 03:08:20.419
21	PB-1777658945030-ac458331	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:09:05.161079	2026-05-02 03:09:05.03
22	PB-1777658988254-55bdc843	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:09:48.284553	2026-05-02 03:09:48.254
23	PB-1777658998751-b90ad9d7	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-29T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:09:58.779509	2026-05-02 03:09:58.751
24	PB-1777659035444-c758bd83	6	{"guests": 1, "checkIn": "2026-05-25T16:00:00.000Z", "checkOut": "2026-05-31T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": "123"}	2026-05-02 02:10:35.469114	2026-05-02 03:10:35.444
25	PB-1777659084626-a3b6f465	6	{"guests": 1, "checkIn": "2026-05-04T16:00:00.000Z", "checkOut": "2026-05-05T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 02:11:24.65749	2026-05-02 03:11:24.626
28	PB-1777665543237-c7e7ea61	6	{"guests": 1, "checkIn": "2026-05-05T16:00:00.000Z", "checkOut": "2026-05-06T16:00:00.000Z", "metadata": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "minors": false, "lastName": "Ramos", "firstName": "Rye Vincent", "durationHours": null, "includedGuests": 4, "extraGuestCount": 0, "selectedDuration": null, "extraGuestFeeTotal": 0, "extraGuestFeePerNight": 300}, "guestInfo": {"email": "ryevincent99@gmail.com", "phone": "09605169674", "lastName": "Ramos", "firstName": "Rye Vincent"}, "propertyId": 12, "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "specialRequests": ""}	2026-05-02 03:59:03.274454	2026-05-02 04:59:03.237
\.


--
-- Data for Name: promo_code_properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promo_code_properties (promo_code_id, property_id) FROM stdin;
1	12
\.


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promo_codes (id, host_id, code, type, value, description, start_date, end_date, usage_limit, used_count, min_booking_amount, status, created_at, updated_at) FROM stdin;
1	8	SUMMERDAY	percentage	50.00	for summer promo	2026-04-28	2026-05-30	10	2	100.00	active	2026-04-30 02:08:46.646719	2026-05-02 04:06:56.747854
2	8	A	percentage	2.00	asdd	2026-05-02	2026-05-02	1	0	12.00	active	2026-05-03 05:57:06.874309	2026-05-03 05:57:06.874309
7	8	AAAA	fixed	2.00	a	2026-05-01	2026-05-02	2	0	21.00	active	2026-05-03 06:04:54.457601	2026-05-03 06:04:54.457601
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.properties (id, host_id, title, description, type, bedrooms, bathrooms, max_guests, price_per_night, address, amenities, images, availability, rating, review_count, time_availability, created_at, updated_at, payment_methods) FROM stdin;
12	8	Cozy	A Apartment that can cater 4 person	Apartment	1	1	4	600.00	{"city": "Sanguine Bookkeeping Services, M. Salvador Street, San Perfecto, 1st District, San Juan, Eastern Manila District, Metro Manila, 1500, Philippines", "state": "N/A", "fullAddress": "Sanguine Bookkeeping Services, M. Salvador Street, San Perfecto, 1st District, San Juan, Eastern Manila District, Metro Manila, 1500, Philippines"}	{Wifi,Dryer,Pool,"Pet Friendly",Washer,Games,Parking}	{}	t	3.3	3	{"hourlyRate": null, "houseRules": "", "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "extraGuestFee": 300, "enableTimeSlots": true}	2026-04-27 16:28:01.634599	2026-05-02 18:54:07.704192	{"cash": true, "gcash": false, "paymaya": false, "bankTransfer": false}
923	8	Cozy2	pogi ni carlu	Apartment	1	1	4	1500.00	{"city": "Nicolas Zamora Street, Barangay 245, Tondo, First District, Manila, Capital District, Metro Manila, 1012, Philippines", "state": "N/A", "fullAddress": "Nicolas Zamora Street, Barangay 245, Tondo, First District, Manila, Capital District, Metro Manila, 1012, Philippines"}	{Wifi,Dryer,Pool,"Pet Friendly",Balcony,Gym,Washer,Games,Parking,"Free unli coffee","Free unli popcorn","Netflix Premium"}	{https://res.cloudinary.com/dwo9nknqz/image/upload/v1777725355/smartstay/properties/8/property_1777725353209_7709.jpg}	t	0.0	0	{"hourlyRate": null, "houseRules": "carlu the goat", "bookingType": "fixed", "checkInTime": "15:00", "checkOutTime": "11:00", "extraGuestFee": 300, "enableTimeSlots": true}	2026-05-02 20:39:59.608826	2026-05-02 20:53:53.458	{"cash": true, "gcash": false, "paymaya": true, "bankTransfer": true}
\.


--
-- Data for Name: property_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.property_reviews (id, property_id, booking_id, guest_id, host_id, rating, comment, cleanliness, accuracy, communication, location, check_in, value, created_at, updated_at, host_reply, host_reply_date) FROM stdin;
228	12	22	6	8	4	wow	4	4	4	4	4	4	2026-05-02 18:54:07.697183	2026-05-02 18:54:07.697183	okay po boss thank you po	2026-05-03 03:24:28.840586
224	12	4	6	8	1	ewqewq	1	1	1	1	1	1	2026-05-02 04:27:47.016485	2026-05-02 04:27:47.016485	okiii	2026-05-03 03:27:21.240075
223	12	5	6	8	5	its good really	4	4	4	4	5	4	2026-05-02 04:26:53.977934	2026-05-02 04:26:53.977934	thanks kuys	2026-05-03 03:29:20.96377
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, settings, updated_at) FROM stdin;
1	{"fees": {"hostCommission": 3.0, "guestServiceFee": 5.0, "paymentProcessingFee": 2.9}, "limits": {"maxBookingDuration": 30, "minBookingDuration": 1, "maxGuestsPerBooking": 16, "maxPropertiesPerHost": 10}, "platform": {"bookingEnabled": true, "maintenanceMode": false, "paymentProcessing": true, "registrationEnabled": true}, "security": {"sessionTimeout": 24, "maxLoginAttempts": 5, "passwordMinLength": 8, "twoFactorRequired": false}}	2026-04-27 18:19:02.079147
\.


--
-- Data for Name: system_status; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_status (id, service_name, status, last_checked, created_at, updated_at) FROM stdin;
1	message_system	online	2026-05-03 18:13:59.181691	2026-05-03 18:13:59.181691	2026-05-03 18:13:59.181691
2	chatbot_service	online	2026-05-03 18:13:59.181691	2026-05-03 18:13:59.181691	2026-05-03 18:13:59.181691
3	notification_service	online	2026-05-03 18:13:59.181691	2026-05-03 18:13:59.181691	2026-05-03 18:13:59.181691
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notifications (id, user_id, type, title, message, is_read, created_at, subject_id) FROM stdin;
106	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-29 18:14:14.804135	\N
116	8	message	New Message	Rye Vincent Ramos sent you a message	t	2026-04-30 02:15:48.275225	\N
145	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 04/05/2026 to 05/05/2026	t	2026-04-30 02:40:22.352911	\N
146	6	booking	Booking Status Updated	Your booking for Cozy has been confirmed	t	2026-04-30 02:40:53.850841	\N
178	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:13.654091	\N
173	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:12.096578	\N
172	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:11.877978	\N
171	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:11.70025	\N
169	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:11.348453	\N
168	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:11.160401	\N
167	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:10.980992	\N
166	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:10.805147	\N
177	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:13.466061	\N
176	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:13.293435	\N
165	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:10.628826	\N
164	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:10.437369	\N
163	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:10.241377	\N
162	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:10.035755	\N
161	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:09.78517	\N
160	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:09.524504	\N
159	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:09.27404	\N
158	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:08.962361	\N
157	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:08.586143	\N
156	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:06.968869	\N
174	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:12.95333	\N
175	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:13.150936	\N
154	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:39:10.081639	\N
153	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:38:56.741197	\N
151	8	message	New Message	Rye Vincent Ramos sent you a message	t	2026-04-30 17:38:15.414224	\N
152	8	message	New Message	Rye Vincent Ramos sent you a message	t	2026-04-30 17:38:33.676077	\N
179	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:13.826975	\N
170	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:54:11.529111	\N
155	6	message	New Message	Ryu Ramos sent you a message	t	2026-04-30 17:39:16.995268	\N
217	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 14/05/2026 to 15/05/2026	f	2026-05-01 22:20:15.797173	\N
226	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 15/05/2026 to 16/05/2026	f	2026-05-01 22:30:59.3066	\N
231	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 22/05/2026 to 23/05/2026	f	2026-05-01 22:36:54.65436	\N
232	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 27/05/2026 to 28/05/2026	f	2026-05-01 22:40:31.218561	\N
233	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 28/05/2026 to 29/05/2026	f	2026-05-01 22:45:34.143154	\N
234	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 29/05/2026 to 30/05/2026	f	2026-05-01 22:51:53.017018	\N
239	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 19/05/2026 to 20/05/2026	f	2026-05-01 22:58:51.053611	\N
240	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 20/05/2026 to 21/05/2026	f	2026-05-01 23:00:11.545837	\N
249	8	booking	New Booking Request	Rye Vincent Ramos has requested to book Cozy from 16/06/2026 to 17/06/2026	f	2026-05-01 23:11:19.251975	\N
299	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy from 12/05/2026 to 13/05/2026 with payment of ₱180.00	f	2026-05-02 01:31:26.828901	\N
300	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy from 25/05/2026 to 26/05/2026 with payment of ₱180.00	f	2026-05-02 01:32:27.284715	\N
317	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy from 05/05/2026 to 06/05/2026 with payment of ₱600.00	f	2026-05-02 02:11:26.42264	\N
318	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy from 12/06/2026 to 13/06/2026 with payment of ₱600.00	f	2026-05-02 02:15:16.195166	\N
331	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy from 06/05/2026 to 07/05/2026 with payment of ₱300.00	f	2026-05-02 03:59:05.084587	\N
332	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy from 07/05/2026 to 08/05/2026 with payment of ₱300.00	f	2026-05-02 04:06:56.747854	\N
345	6	booking	Booking Status Updated	Your booking for Cozy has been completed	f	2026-05-02 04:24:11.053183	\N
350	6	booking	Booking Status Updated	Your booking for Cozy has been completed	f	2026-05-02 04:27:25.768636	\N
355	6	booking	Booking Status Updated	Your booking for Cozy has been confirmed	f	2026-05-02 18:53:01.173569	\N
404	8	booking	Booking Cancelled	Rye Vincent Ramos has cancelled the booking for Cozy (25/05/2026 - 26/05/2026). Refund: ₱180.00 (100%)	f	2026-05-02 19:31:04.202443	\N
405	8	booking	Booking Cancelled	Rye Vincent Ramos has cancelled the booking for Cozy (06/05/2026 - 07/05/2026). Refund: ₱300.00 (100%)	f	2026-05-02 19:31:19.891075	\N
406	8	booking	Booking Cancelled	Rye Vincent Ramos has cancelled the booking for Cozy (12/05/2026 - 13/05/2026). Refund: ₱180.00 (100%)	f	2026-05-02 19:32:36.936418	\N
407	8	booking	Booking Cancelled	Rye Vincent Ramos has cancelled the booking for Cozy (07/05/2026 - 08/05/2026). Refund: ₱300.00 (100%)	f	2026-05-02 19:33:31.625465	\N
408	8	booking	Booking Cancelled	Rye Vincent Ramos has cancelled the booking for Cozy (19/05/2026 - 20/05/2026).	f	2026-05-02 19:36:28.112492	\N
409	6	booking	Booking Status Updated	Your booking for Cozy has been confirmed	f	2026-05-02 19:38:14.60193	\N
430	8	booking	New Booking Request	Rye Vincent Ramos has booked Cozy2 from 02/05/2026 to 09/05/2026 with payment of ₱10500.00	f	2026-05-02 21:02:34.658104	\N
431	6	booking	Booking Status Updated	Your booking for Cozy2 has been confirmed	f	2026-05-02 21:02:57.156218	\N
448	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:27:40.332722	\N
449	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:34:43.786586	\N
454	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:37:21.945454	\N
455	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:37:26.359768	\N
456	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:37:28.286133	\N
457	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:37:30.303696	\N
458	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:37:31.905979	\N
459	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:41:32.151771	\N
460	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:41:38.478534	\N
461	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:41:41.56601	\N
462	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:41:43.712724	\N
463	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:42:49.890413	\N
464	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:42:50.812504	\N
465	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-02 21:42:51.578144	\N
472	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:48.058346	\N
473	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:49.969332	\N
474	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:50.729738	\N
475	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:52.777093	\N
476	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:53.322051	\N
477	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:54.171775	\N
478	8	message	New Message	Rye Vincent Ramos sent you a message	f	2026-05-02 21:43:54.746114	\N
466	6	message	New Message	Ryu Ramos sent you a message	t	2026-05-02 21:42:53.577303	\N
471	6	message	New Message	Ryu Ramos sent you a message	t	2026-05-02 21:43:44.697672	\N
479	8	message	New Message	Rye Vincent Ramos sent you a message	t	2026-05-02 21:43:56.709343	\N
697	6	review_reply	Host replied to your review	The host has replied to your review for "Cozy": "thanks kuys"	t	2026-05-03 03:29:20.96509	5
488	8	booking	Booking Cancelled	Rye Vincent Ramos has cancelled the booking for Cozy (16/06/2026 - 17/06/2026).	t	2026-05-02 22:23:19.781519	\N
769	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-03 06:06:54.285491	\N
770	6	message	New Message	Ryu Ramos sent you a message	f	2026-05-03 06:06:55.384002	\N
771	6	payment	Payment Approved	Your payment of ₱600.00 for Cozy has been approved	f	2026-05-03 06:09:15.801947	\N
772	6	payment	Payment Approved	Your payment of ₱600.00 for Cozy has been approved	f	2026-05-03 06:10:14.3996	\N
773	6	payment	Payment Approved	Your payment of ₱600.00 for Cozy has been approved	f	2026-05-03 06:10:58.611076	\N
774	6	booking	Booking Status Updated	Your booking for Cozy has been confirmed	f	2026-05-03 06:14:18.440224	\N
775	6	booking	Booking Status Updated	Your booking for Cozy has been cancelled	f	2026-05-03 06:14:19.712432	\N
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profiles (user_id, bio, profile_picture, preferences, host_info, guest_info, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, first_name, last_name, email, phone, company, password_hash, role, verification_status, created_at, updated_at, email_verified, verification_token, verification_token_expires) FROM stdin;
6	Rye Vincent	Ramos	ryevincent99@gmail.com	+639605169674		$2a$10$h.hW1tMU.Q3PrRHaSsHDqudfU8z.18I38pUBKjBTM63mIu90l0gQ2	guest	not_required	2026-04-07 01:23:01.471907	2026-05-02 21:49:28.118644	t	\N	\N
1040	Admin	User	admin@smartstay.com			$2a$10$zMYzZMgMLwpkULlXaoVDau9CYgd/c4PiX8YOjz4AMaiwfsm.t/GkS	admin	verified	2026-05-03 14:05:08.572852	2026-05-03 14:05:08.572852	t	\N	\N
1041	Communication	Admin	comadmin@smartstay.com			$2a$10$3tyOE5SwPGxMKFtaDuhPreFeDEnBbIcVJjRgJL8WE2CSGXbLtXz26	communication_admin	verified	2026-05-03 14:05:08.572852	2026-05-03 14:05:08.572852	t	\N	\N
8	Ryu	Ramos	Ryuramos@gmail.com	09123456789	Company Boss	$2a$10$Z./AnVu/VkfVgT.X96I9BeUaI3jZQCI27z.5/6166UNz2A2TJHR0a	host	verified	2026-04-07 19:06:44.097225	2026-05-03 16:49:13.040319	t	\N	\N
\.


--
-- Name: admin_activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_activity_logs_id_seq', 793, true);


--
-- Name: admin_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_notifications_id_seq', 594, true);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.bookings_id_seq', 26, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 105, true);


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_sessions_id_seq', 5, true);


--
-- Name: chatbot_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chatbot_messages_id_seq', 94, true);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 1, false);


--
-- Name: disputes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.disputes_id_seq', 1, false);


--
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faqs_id_seq', 8, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_id_seq', 10, true);


--
-- Name: host_expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.host_expenses_id_seq', 15, true);


--
-- Name: host_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.host_reviews_id_seq', 398, true);


--
-- Name: host_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.host_verifications_id_seq', 3, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 83, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payments_id_seq', 23, true);


--
-- Name: payouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payouts_id_seq', 1, false);


--
-- Name: pending_bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pending_bookings_id_seq', 31, true);


--
-- Name: promo_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.promo_codes_id_seq', 7, true);


--
-- Name: properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.properties_id_seq', 2083, true);


--
-- Name: property_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.property_reviews_id_seq', 600, true);


--
-- Name: system_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_status_id_seq', 6, true);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_notifications_id_seq', 899, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1076, true);


--
-- Name: admin_activity_logs admin_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_session_id_key UNIQUE (session_id);


--
-- Name: chatbot_messages_backup chatbot_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chatbot_messages_backup
    ADD CONSTRAINT chatbot_messages_pkey PRIMARY KEY (id);


--
-- Name: chatbot_settings chatbot_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chatbot_settings
    ADD CONSTRAINT chatbot_settings_pkey PRIMARY KEY (id);


--
-- Name: communication_settings communication_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_settings
    ADD CONSTRAINT communication_settings_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_property_id_key UNIQUE (user_id, property_id);


--
-- Name: host_expenses host_expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_expenses
    ADD CONSTRAINT host_expenses_pkey PRIMARY KEY (id);


--
-- Name: host_reviews host_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_reviews
    ADD CONSTRAINT host_reviews_pkey PRIMARY KEY (id);


--
-- Name: host_verifications host_verifications_host_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_verifications
    ADD CONSTRAINT host_verifications_host_user_id_key UNIQUE (host_user_id);


--
-- Name: host_verifications host_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_verifications
    ADD CONSTRAINT host_verifications_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: pending_bookings pending_bookings_pending_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_bookings
    ADD CONSTRAINT pending_bookings_pending_id_key UNIQUE (pending_id);


--
-- Name: pending_bookings pending_bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_bookings
    ADD CONSTRAINT pending_bookings_pkey PRIMARY KEY (id);


--
-- Name: promo_code_properties promo_code_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_code_properties
    ADD CONSTRAINT promo_code_properties_pkey PRIMARY KEY (promo_code_id, property_id);


--
-- Name: promo_codes promo_codes_host_id_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_host_id_code_key UNIQUE (host_id, code);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: property_reviews property_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_reviews
    ADD CONSTRAINT property_reviews_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_status system_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_status
    ADD CONSTRAINT system_status_pkey PRIMARY KEY (id);


--
-- Name: system_status system_status_service_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_status
    ADD CONSTRAINT system_status_service_name_key UNIQUE (service_name);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_activity_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_activity_action ON public.admin_activity_logs USING btree (action);


--
-- Name: idx_admin_activity_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_activity_created_at ON public.admin_activity_logs USING btree (created_at DESC);


--
-- Name: idx_admin_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_read ON public.admin_notifications USING btree (is_read);


--
-- Name: idx_admin_notifications_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_subject_id ON public.admin_notifications USING btree (subject_id);


--
-- Name: idx_admin_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_notifications_type ON public.admin_notifications USING btree (type);


--
-- Name: idx_bookings_check_in; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_check_in ON public.bookings USING btree (check_in);


--
-- Name: idx_bookings_check_out; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_check_out ON public.bookings USING btree (check_out);


--
-- Name: idx_bookings_guest_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_guest_id ON public.bookings USING btree (guest_id);


--
-- Name: idx_bookings_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_host_id ON public.bookings USING btree (host_id);


--
-- Name: idx_bookings_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bookings_property_id ON public.bookings USING btree (property_id);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: idx_chat_messages_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_session_id ON public.chat_messages USING btree (session_id);


--
-- Name: idx_chat_messages_session_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_session_sender ON public.chat_messages USING btree (session_id, sender);


--
-- Name: idx_chat_sessions_escalated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_escalated ON public.chat_sessions USING btree (escalated);


--
-- Name: idx_chat_sessions_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_resolved ON public.chat_sessions USING btree (resolved);


--
-- Name: idx_chat_sessions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions USING btree (session_id);


--
-- Name: idx_chat_sessions_started_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_started_at ON public.chat_sessions USING btree (started_at);


--
-- Name: idx_chat_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions USING btree (user_id);


--
-- Name: idx_chatbot_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chatbot_messages_created_at ON public.chatbot_messages_backup USING btree (created_at DESC);


--
-- Name: idx_chatbot_messages_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chatbot_messages_session_id ON public.chatbot_messages_backup USING btree (session_id);


--
-- Name: idx_chatbot_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chatbot_messages_user_id ON public.chatbot_messages_backup USING btree (user_id);


--
-- Name: idx_contact_messages_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_messages_created ON public.contact_messages USING btree (created_at DESC);


--
-- Name: idx_contact_messages_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_messages_email ON public.contact_messages USING btree (email);


--
-- Name: idx_contact_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contact_messages_status ON public.contact_messages USING btree (status);


--
-- Name: idx_disputes_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_booking_id ON public.disputes USING btree (booking_id);


--
-- Name: idx_disputes_guest_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_guest_id ON public.disputes USING btree (guest_id);


--
-- Name: idx_disputes_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_host_id ON public.disputes USING btree (host_id);


--
-- Name: idx_disputes_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_priority ON public.disputes USING btree (priority);


--
-- Name: idx_disputes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_disputes_status ON public.disputes USING btree (status);


--
-- Name: idx_faqs_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faqs_active ON public.faqs USING btree (is_active);


--
-- Name: idx_faqs_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_faqs_category ON public.faqs USING btree (category);


--
-- Name: idx_host_expenses_expense_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_host_expenses_expense_date ON public.host_expenses USING btree (expense_date DESC);


--
-- Name: idx_host_expenses_host_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_host_expenses_host_user_id ON public.host_expenses USING btree (host_user_id);


--
-- Name: idx_host_reviews_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_host_reviews_host_id ON public.host_reviews USING btree (host_id);


--
-- Name: idx_host_verifications_host_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_host_verifications_host_user_id ON public.host_verifications USING btree (host_user_id);


--
-- Name: idx_host_verifications_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_host_verifications_status ON public.host_verifications USING btree (status);


--
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);


--
-- Name: idx_messages_receiver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_receiver_id ON public.messages USING btree (receiver_id);


--
-- Name: idx_messages_sender_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);


--
-- Name: idx_messages_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_status ON public.messages USING btree (status);


--
-- Name: idx_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);


--
-- Name: idx_payments_booking_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);


--
-- Name: idx_payments_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_host_id ON public.payments USING btree (host_id);


--
-- Name: idx_payments_payer_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_payer_user_id ON public.payments USING btree (payer_user_id);


--
-- Name: idx_payouts_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_approved_by ON public.payouts USING btree (approved_by);


--
-- Name: idx_payouts_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_host_id ON public.payouts USING btree (host_id);


--
-- Name: idx_payouts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payouts_status ON public.payouts USING btree (status);


--
-- Name: idx_pending_bookings_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_bookings_expires_at ON public.pending_bookings USING btree (expires_at);


--
-- Name: idx_pending_bookings_pending_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pending_bookings_pending_id ON public.pending_bookings USING btree (pending_id);


--
-- Name: idx_promo_code_properties_promo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promo_code_properties_promo ON public.promo_code_properties USING btree (promo_code_id);


--
-- Name: idx_promo_code_properties_property; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promo_code_properties_property ON public.promo_code_properties USING btree (property_id);


--
-- Name: idx_promo_codes_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promo_codes_code ON public.promo_codes USING btree (code);


--
-- Name: idx_promo_codes_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promo_codes_host_id ON public.promo_codes USING btree (host_id);


--
-- Name: idx_promo_codes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_promo_codes_status ON public.promo_codes USING btree (status);


--
-- Name: idx_properties_availability; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_properties_availability ON public.properties USING btree (availability);


--
-- Name: idx_properties_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_properties_host_id ON public.properties USING btree (host_id);


--
-- Name: idx_properties_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_properties_type ON public.properties USING btree (type);


--
-- Name: idx_property_reviews_guest_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_reviews_guest_id ON public.property_reviews USING btree (guest_id);


--
-- Name: idx_property_reviews_host_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_reviews_host_id ON public.property_reviews USING btree (host_id);


--
-- Name: idx_property_reviews_property_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_property_reviews_property_id ON public.property_reviews USING btree (property_id);


--
-- Name: idx_user_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_is_read ON public.user_notifications USING btree (is_read);


--
-- Name: idx_user_notifications_subject_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_subject_id ON public.user_notifications USING btree (subject_id);


--
-- Name: idx_user_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_notifications_user_id ON public.user_notifications USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_users_verification_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_verification_token ON public.users USING btree (verification_token);


--
-- Name: admin_activity_logs admin_activity_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: admin_activity_logs admin_activity_logs_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: admin_notifications admin_notifications_target_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(session_id) ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: chat_sessions chat_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: chatbot_messages_backup chatbot_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chatbot_messages_backup
    ADD CONSTRAINT chatbot_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: disputes disputes_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: favorites favorites_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages fk_messages_replied_by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_replied_by FOREIGN KEY (replied_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: messages fk_messages_user_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: host_expenses host_expenses_host_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_expenses
    ADD CONSTRAINT host_expenses_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: host_reviews host_reviews_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_reviews
    ADD CONSTRAINT host_reviews_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: host_reviews host_reviews_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_reviews
    ADD CONSTRAINT host_reviews_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: host_verifications host_verifications_host_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_verifications
    ADD CONSTRAINT host_verifications_host_user_id_fkey FOREIGN KEY (host_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: host_verifications host_verifications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_verifications
    ADD CONSTRAINT host_verifications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payments payments_payer_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payer_user_id_fkey FOREIGN KEY (payer_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payouts payouts_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: payouts payouts_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pending_bookings pending_bookings_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_bookings
    ADD CONSTRAINT pending_bookings_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: promo_code_properties promo_code_properties_promo_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_code_properties
    ADD CONSTRAINT promo_code_properties_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id) ON DELETE CASCADE;


--
-- Name: promo_code_properties promo_code_properties_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_code_properties
    ADD CONSTRAINT promo_code_properties_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: promo_codes promo_codes_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: properties properties_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: property_reviews property_reviews_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_reviews
    ADD CONSTRAINT property_reviews_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: property_reviews property_reviews_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_reviews
    ADD CONSTRAINT property_reviews_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: property_reviews property_reviews_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.property_reviews
    ADD CONSTRAINT property_reviews_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;


--
-- Name: user_notifications user_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict SDB23xI3lWS38184Q9cYtXHlUn3fNGZUdrEaY3EYF4GR5jB8htdpSQsZHYoyu3c

