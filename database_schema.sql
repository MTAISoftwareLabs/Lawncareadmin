--
-- PostgreSQL database dump
--

\restrict 5FFFd0IGkZ5vbl9clQUcOVGsu5muGa0URqwad884Gyb3d0c7MPXtfKY31nGdiSW

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_integrations (
    id integer NOT NULL,
    provider character varying(50) NOT NULL,
    public_key character varying(255),
    secret_key text,
    additional_config text,
    is_active boolean DEFAULT true,
    updated_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_integrations_id_seq OWNED BY public.admin_integrations.id;


--
-- Name: compliance_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.compliance_settings (
    id integer NOT NULL,
    business_name character varying(255) NOT NULL,
    gst_number character varying(50),
    pan_number character varying(20),
    tan_number character varying(20),
    cin_number character varying(50),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(10),
    phone character varying(20),
    email character varying(255),
    enable_gst boolean DEFAULT true,
    default_tax_rate real DEFAULT 18,
    tax_inclusive boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: compliance_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.compliance_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: compliance_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.compliance_settings_id_seq OWNED BY public.compliance_settings.id;


--
-- Name: customer_feedback_videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_feedback_videos (
    id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer,
    product_id integer,
    video_url text NOT NULL,
    thumbnail text,
    title character varying(255) NOT NULL,
    description text,
    rating integer DEFAULT 5,
    is_approved boolean DEFAULT false,
    is_published boolean DEFAULT false,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: customer_feedback_videos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customer_feedback_videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customer_feedback_videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customer_feedback_videos_id_seq OWNED BY public.customer_feedback_videos.id;


--
-- Name: hero_banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hero_banners (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    image_url text NOT NULL,
    link_url text,
    button_text character varying(100),
    "position" integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hero_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hero_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hero_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hero_banners_id_seq OWNED BY public.hero_banners.id;


--
-- Name: landing_page_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landing_page_settings (
    id integer NOT NULL,
    app_name character varying(100) DEFAULT 'AYUSHRATNA'::character varying NOT NULL,
    logo_url text,
    hero_title text DEFAULT 'Natural Wellness, Ancient Wisdom'::text NOT NULL,
    hero_subtitle text DEFAULT 'Authentic Ayurvedic & Herbal products for holistic health'::text NOT NULL,
    hero_button_text character varying(50) DEFAULT 'Shop Now'::character varying NOT NULL,
    primary_color character varying(50) DEFAULT 'hsl(142 76% 36%)'::character varying NOT NULL,
    hero_image_1 text,
    hero_image_2 text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: landing_page_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.landing_page_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: landing_page_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.landing_page_settings_id_seq OWNED BY public.landing_page_settings.id;


--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_logs (
    id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    channel character varying(20) NOT NULL,
    recipient character varying(255) NOT NULL,
    subject character varying(255),
    message text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    sent_at timestamp without time zone,
    error_message text,
    metadata text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_logs_id_seq OWNED BY public.notification_logs.id;


--
-- Name: notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_settings (
    id integer NOT NULL,
    email_enabled boolean DEFAULT true,
    sms_enabled boolean DEFAULT false,
    push_enabled boolean DEFAULT false,
    smtp_host character varying(255),
    smtp_port integer,
    smtp_user character varying(255),
    smtp_password text,
    smtp_from character varying(255),
    twilio_account_sid character varying(255),
    twilio_auth_token text,
    twilio_phone_number character varying(20),
    firebase_server_key text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_settings_id_seq OWNED BY public.notification_settings.id;


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_templates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    subject character varying(255),
    email_template text,
    sms_template text,
    push_template text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_templates_id_seq OWNED BY public.notification_templates.id;


--
-- Name: order_tracking_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_tracking_history (
    id integer NOT NULL,
    order_id integer NOT NULL,
    status character varying(50) NOT NULL,
    location character varying(255),
    description text,
    updated_by character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: order_tracking_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_tracking_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_tracking_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_tracking_history_id_seq OWNED BY public.order_tracking_history.id;


--
-- Name: product_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_views (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer,
    session_id character varying(255),
    viewed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: product_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_views_id_seq OWNED BY public.product_views.id;


--
-- Name: shop_banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_banners (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    image_url text NOT NULL,
    link_url text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    description text,
    button_text character varying(100)
);


--
-- Name: shop_banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_banners_id_seq OWNED BY public.shop_banners.id;


--
-- Name: shop_blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_blog_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    content text NOT NULL,
    excerpt text,
    author_id integer NOT NULL,
    featured_image text,
    meta_description text,
    meta_keywords text,
    is_published boolean DEFAULT false,
    published_at timestamp without time zone,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_blog_posts_id_seq OWNED BY public.shop_blog_posts.id;


--
-- Name: shop_cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_cart_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_cart_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_cart_items_id_seq OWNED BY public.shop_cart_items.id;


--
-- Name: shop_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_categories_id_seq OWNED BY public.shop_categories.id;


--
-- Name: shop_delivery_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_delivery_partners (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    vehicle_type character varying(50) NOT NULL,
    vehicle_number character varying(50),
    assigned_areas text,
    is_active boolean DEFAULT true,
    total_deliveries integer DEFAULT 0,
    rating numeric(3,2) DEFAULT '0'::numeric,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_delivery_partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_delivery_partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_delivery_partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_delivery_partners_id_seq OWNED BY public.shop_delivery_partners.id;


--
-- Name: shop_faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_faqs (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) NOT NULL,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_faqs_id_seq OWNED BY public.shop_faqs.id;


--
-- Name: shop_flash_sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_flash_sales (
    id integer NOT NULL,
    product_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    original_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    discount_percentage integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    stock_limit integer,
    sold_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_flash_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_flash_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_flash_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_flash_sales_id_seq OWNED BY public.shop_flash_sales.id;


--
-- Name: shop_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);


--
-- Name: shop_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_order_items_id_seq OWNED BY public.shop_order_items.id;


--
-- Name: shop_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_orders (
    id integer NOT NULL,
    user_id integer,
    address_id integer,
    guest_email character varying(255),
    guest_phone character varying(20),
    guest_name character varying(255),
    total numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    shipping_address text NOT NULL,
    shipping_city character varying(100) NOT NULL,
    shipping_state character varying(100) NOT NULL,
    shipping_zip character varying(20) NOT NULL,
    shipping_country character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    delivery_partner_id integer
);


--
-- Name: shop_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_orders_id_seq OWNED BY public.shop_orders.id;


--
-- Name: shop_product_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_product_reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    title character varying(255),
    comment text,
    is_verified_purchase boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_product_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_product_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_product_reviews_id_seq OWNED BY public.shop_product_reviews.id;


--
-- Name: shop_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category character varying(100) NOT NULL,
    image text,
    stock integer DEFAULT 0 NOT NULL,
    featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    sale_price numeric(10,2),
    discount_percentage integer
);


--
-- Name: shop_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_products_id_seq OWNED BY public.shop_products.id;


--
-- Name: shop_promo_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_promo_codes (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    min_purchase_amount numeric(10,2),
    max_discount_amount numeric(10,2),
    usage_limit integer,
    used_count integer DEFAULT 0,
    valid_from timestamp without time zone NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_promo_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_promo_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_promo_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_promo_codes_id_seq OWNED BY public.shop_promo_codes.id;


--
-- Name: shop_recently_viewed; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_recently_viewed (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_recently_viewed_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_recently_viewed_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_recently_viewed_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_recently_viewed_id_seq OWNED BY public.shop_recently_viewed.id;


--
-- Name: shop_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_returns (
    id integer NOT NULL,
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    reason text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    refund_amount numeric(10,2) NOT NULL,
    refund_status character varying(50) DEFAULT 'pending'::character varying,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_returns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_returns_id_seq OWNED BY public.shop_returns.id;


--
-- Name: shop_static_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_static_pages (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_static_pages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_static_pages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_static_pages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_static_pages_id_seq OWNED BY public.shop_static_pages.id;


--
-- Name: shop_testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_testimonials (
    id integer NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_image text,
    rating integer DEFAULT 5 NOT NULL,
    testimonial text NOT NULL,
    is_featured boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_testimonials_id_seq OWNED BY public.shop_testimonials.id;


--
-- Name: shop_user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_user_addresses (
    id integer NOT NULL,
    user_id integer NOT NULL,
    label character varying(100) DEFAULT 'Home'::character varying NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    zip_code character varying(20) NOT NULL,
    country character varying(100) DEFAULT 'India'::character varying NOT NULL,
    is_default boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_user_addresses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_user_addresses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_user_addresses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_user_addresses_id_seq OWNED BY public.shop_user_addresses.id;


--
-- Name: shop_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(100),
    zip_code character varying(20),
    country character varying(100),
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_users_id_seq OWNED BY public.shop_users.id;


--
-- Name: shop_wishlist_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_wishlist_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shop_wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_wishlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_wishlist_items_id_seq OWNED BY public.shop_wishlist_items.id;


--
-- Name: support_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_settings (
    id integer NOT NULL,
    support_email character varying(255) DEFAULT 'support@ayushratna.com'::character varying NOT NULL,
    support_phone character varying(20) DEFAULT '+91 1800-123-4567'::character varying NOT NULL,
    whatsapp_number character varying(20),
    business_hours text DEFAULT 'Mon-Sat: 9:00 AM - 6:00 PM'::text NOT NULL,
    chat_widget_enabled boolean DEFAULT true,
    chat_widget_code text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: support_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_settings_id_seq OWNED BY public.support_settings.id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    user_id integer,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    subject character varying(255) NOT NULL,
    message text NOT NULL,
    channel character varying(20) DEFAULT 'email'::character varying NOT NULL,
    status character varying(20) DEFAULT 'new'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    assigned_admin_id integer,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: tax_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tax_rates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    rate real NOT NULL,
    state character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: tax_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tax_rates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tax_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tax_rates_id_seq OWNED BY public.tax_rates.id;


--
-- Name: admin_integrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_integrations ALTER COLUMN id SET DEFAULT nextval('public.admin_integrations_id_seq'::regclass);


--
-- Name: compliance_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_settings ALTER COLUMN id SET DEFAULT nextval('public.compliance_settings_id_seq'::regclass);


--
-- Name: customer_feedback_videos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback_videos ALTER COLUMN id SET DEFAULT nextval('public.customer_feedback_videos_id_seq'::regclass);


--
-- Name: hero_banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_banners ALTER COLUMN id SET DEFAULT nextval('public.hero_banners_id_seq'::regclass);


--
-- Name: landing_page_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_settings ALTER COLUMN id SET DEFAULT nextval('public.landing_page_settings_id_seq'::regclass);


--
-- Name: notification_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs ALTER COLUMN id SET DEFAULT nextval('public.notification_logs_id_seq'::regclass);


--
-- Name: notification_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings ALTER COLUMN id SET DEFAULT nextval('public.notification_settings_id_seq'::regclass);


--
-- Name: notification_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates ALTER COLUMN id SET DEFAULT nextval('public.notification_templates_id_seq'::regclass);


--
-- Name: order_tracking_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_tracking_history ALTER COLUMN id SET DEFAULT nextval('public.order_tracking_history_id_seq'::regclass);


--
-- Name: product_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views ALTER COLUMN id SET DEFAULT nextval('public.product_views_id_seq'::regclass);


--
-- Name: shop_banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_banners ALTER COLUMN id SET DEFAULT nextval('public.shop_banners_id_seq'::regclass);


--
-- Name: shop_blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_blog_posts ALTER COLUMN id SET DEFAULT nextval('public.shop_blog_posts_id_seq'::regclass);


--
-- Name: shop_cart_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_cart_items ALTER COLUMN id SET DEFAULT nextval('public.shop_cart_items_id_seq'::regclass);


--
-- Name: shop_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_categories ALTER COLUMN id SET DEFAULT nextval('public.shop_categories_id_seq'::regclass);


--
-- Name: shop_delivery_partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_delivery_partners ALTER COLUMN id SET DEFAULT nextval('public.shop_delivery_partners_id_seq'::regclass);


--
-- Name: shop_faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_faqs ALTER COLUMN id SET DEFAULT nextval('public.shop_faqs_id_seq'::regclass);


--
-- Name: shop_flash_sales id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_flash_sales ALTER COLUMN id SET DEFAULT nextval('public.shop_flash_sales_id_seq'::regclass);


--
-- Name: shop_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items ALTER COLUMN id SET DEFAULT nextval('public.shop_order_items_id_seq'::regclass);


--
-- Name: shop_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders ALTER COLUMN id SET DEFAULT nextval('public.shop_orders_id_seq'::regclass);


--
-- Name: shop_product_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_product_reviews ALTER COLUMN id SET DEFAULT nextval('public.shop_product_reviews_id_seq'::regclass);


--
-- Name: shop_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_products ALTER COLUMN id SET DEFAULT nextval('public.shop_products_id_seq'::regclass);


--
-- Name: shop_promo_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_promo_codes ALTER COLUMN id SET DEFAULT nextval('public.shop_promo_codes_id_seq'::regclass);


--
-- Name: shop_recently_viewed id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_recently_viewed ALTER COLUMN id SET DEFAULT nextval('public.shop_recently_viewed_id_seq'::regclass);


--
-- Name: shop_returns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_returns ALTER COLUMN id SET DEFAULT nextval('public.shop_returns_id_seq'::regclass);


--
-- Name: shop_static_pages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_static_pages ALTER COLUMN id SET DEFAULT nextval('public.shop_static_pages_id_seq'::regclass);


--
-- Name: shop_testimonials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_testimonials ALTER COLUMN id SET DEFAULT nextval('public.shop_testimonials_id_seq'::regclass);


--
-- Name: shop_user_addresses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_user_addresses ALTER COLUMN id SET DEFAULT nextval('public.shop_user_addresses_id_seq'::regclass);


--
-- Name: shop_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users ALTER COLUMN id SET DEFAULT nextval('public.shop_users_id_seq'::regclass);


--
-- Name: shop_wishlist_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.shop_wishlist_items_id_seq'::regclass);


--
-- Name: support_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_settings ALTER COLUMN id SET DEFAULT nextval('public.support_settings_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: tax_rates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates ALTER COLUMN id SET DEFAULT nextval('public.tax_rates_id_seq'::regclass);


--
-- Name: admin_integrations admin_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_integrations
    ADD CONSTRAINT admin_integrations_pkey PRIMARY KEY (id);


--
-- Name: admin_integrations admin_integrations_provider_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_integrations
    ADD CONSTRAINT admin_integrations_provider_unique UNIQUE (provider);


--
-- Name: compliance_settings compliance_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.compliance_settings
    ADD CONSTRAINT compliance_settings_pkey PRIMARY KEY (id);


--
-- Name: customer_feedback_videos customer_feedback_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback_videos
    ADD CONSTRAINT customer_feedback_videos_pkey PRIMARY KEY (id);


--
-- Name: hero_banners hero_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hero_banners
    ADD CONSTRAINT hero_banners_pkey PRIMARY KEY (id);


--
-- Name: landing_page_settings landing_page_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page_settings
    ADD CONSTRAINT landing_page_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_settings notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_settings
    ADD CONSTRAINT notification_settings_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_name_unique UNIQUE (name);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: order_tracking_history order_tracking_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_tracking_history
    ADD CONSTRAINT order_tracking_history_pkey PRIMARY KEY (id);


--
-- Name: product_views product_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_pkey PRIMARY KEY (id);


--
-- Name: shop_banners shop_banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_banners
    ADD CONSTRAINT shop_banners_pkey PRIMARY KEY (id);


--
-- Name: shop_blog_posts shop_blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_blog_posts
    ADD CONSTRAINT shop_blog_posts_pkey PRIMARY KEY (id);


--
-- Name: shop_blog_posts shop_blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_blog_posts
    ADD CONSTRAINT shop_blog_posts_slug_unique UNIQUE (slug);


--
-- Name: shop_cart_items shop_cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_cart_items
    ADD CONSTRAINT shop_cart_items_pkey PRIMARY KEY (id);


--
-- Name: shop_categories shop_categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_categories
    ADD CONSTRAINT shop_categories_name_unique UNIQUE (name);


--
-- Name: shop_categories shop_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_categories
    ADD CONSTRAINT shop_categories_pkey PRIMARY KEY (id);


--
-- Name: shop_delivery_partners shop_delivery_partners_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_delivery_partners
    ADD CONSTRAINT shop_delivery_partners_email_unique UNIQUE (email);


--
-- Name: shop_delivery_partners shop_delivery_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_delivery_partners
    ADD CONSTRAINT shop_delivery_partners_pkey PRIMARY KEY (id);


--
-- Name: shop_faqs shop_faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_faqs
    ADD CONSTRAINT shop_faqs_pkey PRIMARY KEY (id);


--
-- Name: shop_flash_sales shop_flash_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_flash_sales
    ADD CONSTRAINT shop_flash_sales_pkey PRIMARY KEY (id);


--
-- Name: shop_order_items shop_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items
    ADD CONSTRAINT shop_order_items_pkey PRIMARY KEY (id);


--
-- Name: shop_orders shop_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_pkey PRIMARY KEY (id);


--
-- Name: shop_product_reviews shop_product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_product_reviews
    ADD CONSTRAINT shop_product_reviews_pkey PRIMARY KEY (id);


--
-- Name: shop_products shop_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_products
    ADD CONSTRAINT shop_products_pkey PRIMARY KEY (id);


--
-- Name: shop_promo_codes shop_promo_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_promo_codes
    ADD CONSTRAINT shop_promo_codes_code_unique UNIQUE (code);


--
-- Name: shop_promo_codes shop_promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_promo_codes
    ADD CONSTRAINT shop_promo_codes_pkey PRIMARY KEY (id);


--
-- Name: shop_recently_viewed shop_recently_viewed_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_recently_viewed
    ADD CONSTRAINT shop_recently_viewed_pkey PRIMARY KEY (id);


--
-- Name: shop_returns shop_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_returns
    ADD CONSTRAINT shop_returns_pkey PRIMARY KEY (id);


--
-- Name: shop_static_pages shop_static_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_static_pages
    ADD CONSTRAINT shop_static_pages_pkey PRIMARY KEY (id);


--
-- Name: shop_static_pages shop_static_pages_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_static_pages
    ADD CONSTRAINT shop_static_pages_slug_unique UNIQUE (slug);


--
-- Name: shop_testimonials shop_testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_testimonials
    ADD CONSTRAINT shop_testimonials_pkey PRIMARY KEY (id);


--
-- Name: shop_user_addresses shop_user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_user_addresses
    ADD CONSTRAINT shop_user_addresses_pkey PRIMARY KEY (id);


--
-- Name: shop_users shop_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users
    ADD CONSTRAINT shop_users_email_unique UNIQUE (email);


--
-- Name: shop_users shop_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_users
    ADD CONSTRAINT shop_users_pkey PRIMARY KEY (id);


--
-- Name: shop_wishlist_items shop_wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_wishlist_items
    ADD CONSTRAINT shop_wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: support_settings support_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_settings
    ADD CONSTRAINT support_settings_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: tax_rates tax_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tax_rates
    ADD CONSTRAINT tax_rates_pkey PRIMARY KEY (id);


--
-- Name: admin_integrations admin_integrations_updated_by_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_integrations
    ADD CONSTRAINT admin_integrations_updated_by_shop_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.shop_users(id);


--
-- Name: customer_feedback_videos customer_feedback_videos_order_id_shop_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback_videos
    ADD CONSTRAINT customer_feedback_videos_order_id_shop_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.shop_orders(id);


--
-- Name: customer_feedback_videos customer_feedback_videos_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback_videos
    ADD CONSTRAINT customer_feedback_videos_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: customer_feedback_videos customer_feedback_videos_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_feedback_videos
    ADD CONSTRAINT customer_feedback_videos_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: notification_logs notification_logs_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: order_tracking_history order_tracking_history_order_id_shop_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_tracking_history
    ADD CONSTRAINT order_tracking_history_order_id_shop_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.shop_orders(id);


--
-- Name: product_views product_views_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: product_views product_views_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_views
    ADD CONSTRAINT product_views_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_blog_posts shop_blog_posts_author_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_blog_posts
    ADD CONSTRAINT shop_blog_posts_author_id_shop_users_id_fk FOREIGN KEY (author_id) REFERENCES public.shop_users(id);


--
-- Name: shop_cart_items shop_cart_items_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_cart_items
    ADD CONSTRAINT shop_cart_items_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: shop_cart_items shop_cart_items_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_cart_items
    ADD CONSTRAINT shop_cart_items_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_flash_sales shop_flash_sales_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_flash_sales
    ADD CONSTRAINT shop_flash_sales_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: shop_order_items shop_order_items_order_id_shop_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items
    ADD CONSTRAINT shop_order_items_order_id_shop_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.shop_orders(id);


--
-- Name: shop_order_items shop_order_items_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_order_items
    ADD CONSTRAINT shop_order_items_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: shop_orders shop_orders_address_id_shop_user_addresses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_address_id_shop_user_addresses_id_fk FOREIGN KEY (address_id) REFERENCES public.shop_user_addresses(id);


--
-- Name: shop_orders shop_orders_delivery_partner_id_shop_delivery_partners_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_delivery_partner_id_shop_delivery_partners_id_fk FOREIGN KEY (delivery_partner_id) REFERENCES public.shop_delivery_partners(id);


--
-- Name: shop_orders shop_orders_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_orders
    ADD CONSTRAINT shop_orders_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_product_reviews shop_product_reviews_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_product_reviews
    ADD CONSTRAINT shop_product_reviews_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: shop_product_reviews shop_product_reviews_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_product_reviews
    ADD CONSTRAINT shop_product_reviews_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_recently_viewed shop_recently_viewed_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_recently_viewed
    ADD CONSTRAINT shop_recently_viewed_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: shop_recently_viewed shop_recently_viewed_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_recently_viewed
    ADD CONSTRAINT shop_recently_viewed_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_returns shop_returns_order_id_shop_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_returns
    ADD CONSTRAINT shop_returns_order_id_shop_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.shop_orders(id);


--
-- Name: shop_returns shop_returns_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_returns
    ADD CONSTRAINT shop_returns_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_user_addresses shop_user_addresses_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_user_addresses
    ADD CONSTRAINT shop_user_addresses_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: shop_wishlist_items shop_wishlist_items_product_id_shop_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_wishlist_items
    ADD CONSTRAINT shop_wishlist_items_product_id_shop_products_id_fk FOREIGN KEY (product_id) REFERENCES public.shop_products(id);


--
-- Name: shop_wishlist_items shop_wishlist_items_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_wishlist_items
    ADD CONSTRAINT shop_wishlist_items_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- Name: support_tickets support_tickets_assigned_admin_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_admin_id_shop_users_id_fk FOREIGN KEY (assigned_admin_id) REFERENCES public.shop_users(id);


--
-- Name: support_tickets support_tickets_user_id_shop_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_user_id_shop_users_id_fk FOREIGN KEY (user_id) REFERENCES public.shop_users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5FFFd0IGkZ5vbl9clQUcOVGsu5muGa0URqwad884Gyb3d0c7MPXtfKY31nGdiSW

