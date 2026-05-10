--
-- PostgreSQL database dump
--

\restrict u0esup1j9Zec6zmA6ePM2UY5LVxYjJWnBSconHwzFdFuYDQvLHbSJPL2zuIZadE

-- Dumped from database version 18.3 (Ubuntu 18.3-1)
-- Dumped by pg_dump version 18.3 (Ubuntu 18.3-1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_users (
    id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    language text DEFAULT 'uz'::text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT app_users_language_check CHECK ((language = ANY (ARRAY['uz'::text, 'ru'::text]))),
    CONSTRAINT app_users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'warehouseManager'::text, 'warehouseWorker'::text])))
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name_uz text NOT NULL,
    name_ru text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    barcode text,
    category_id text NOT NULL,
    description text,
    unit text NOT NULL,
    purchase_price numeric(14,2) DEFAULT 0 NOT NULL,
    selling_price numeric(14,2) DEFAULT 0 NOT NULL,
    current_quantity integer DEFAULT 0 NOT NULL,
    min_quantity integer DEFAULT 0 NOT NULL,
    image_placeholder text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_user_id text DEFAULT 'usr_01'::text NOT NULL,
    CONSTRAINT products_current_quantity_check CHECK ((current_quantity >= 0)),
    CONSTRAINT products_min_quantity_check CHECK ((min_quantity >= 0)),
    CONSTRAINT products_purchase_price_check CHECK ((purchase_price >= (0)::numeric)),
    CONSTRAINT products_selling_price_check CHECK ((selling_price >= (0)::numeric))
);


--
-- Name: stock_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_balances (
    id text NOT NULL,
    product_id text NOT NULL,
    warehouse_id text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stock_balances_quantity_check CHECK ((quantity >= 0))
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id text NOT NULL,
    product_id text NOT NULL,
    warehouse_id text NOT NULL,
    movement_type text NOT NULL,
    quantity integer NOT NULL,
    before_quantity integer NOT NULL,
    after_quantity integer NOT NULL,
    reason text,
    note text,
    created_by text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stock_movements_after_quantity_check CHECK ((after_quantity >= 0)),
    CONSTRAINT stock_movements_before_quantity_check CHECK ((before_quantity >= 0)),
    CONSTRAINT stock_movements_movement_type_check CHECK ((movement_type = ANY (ARRAY['IN'::text, 'OUT'::text, 'TRANSFER'::text, 'ADJUSTMENT'::text, 'RETURN'::text, 'DAMAGED'::text, 'INVENTORY'::text]))),
    CONSTRAINT stock_movements_quantity_check CHECK ((quantity > 0))
);


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.warehouses (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: app_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_users (id, name, role, language, username, password_hash, created_at, updated_at) FROM stdin;
usr_01	Admin Adminov	admin	uz	admin	$2a$06$hyvVeVj.D9.Sy41ctGNEZeFwSjENSC52tESVxUgOhKKuSeXmOXUWS	2026-04-28 06:17:52.547073+00	2026-04-28 06:17:52.547073+00
usr_02	Mansur Yusupov	warehouseManager	uz	manager	$2a$06$wzIl03JAKL.PzJ0Nka/RrORAuMNxFDqZoMxHGFxI2YDrdD.Q4A79y	2026-04-28 06:17:52.547073+00	2026-04-28 06:17:52.547073+00
usr_03	Sherzod Toshmatov	warehouseWorker	uz	worker	$2a$06$PRwFaJaynl7iv9jqj9iQR.sJYYI1iV7K.0yiWzB5c2FFEa0QAtOHi	2026-04-28 06:17:52.547073+00	2026-04-28 06:17:52.547073+00
usr_04	Sotuv Xodimi	warehouseWorker	uz	sotuv1	$2a$06$hffg1p4mdDg1bpA71eqqPuMHBzWcDBr.t5ilfLgB4WKu/J7OcG5k2	2026-05-02 12:55:55.034148+00	2026-05-02 12:55:55.034148+00
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name_uz, name_ru, created_at, updated_at) FROM stdin;
cat_01	Yog'ochlar	Деревянные изделия	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_02	Latunlar	Латунные изделия	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_03	Keramika buyumlar	Керамические изделия	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_04	Ayollar libosi	Женская одежда	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_05	Erkaklar libosi	Мужская одежда	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_06	Pichoqlar	Ножи	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_07	Shkatulkalar	Шкатулки	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_08	Bosh kiyimlar	Головные уборы	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_09	Magnitlar	Магниты	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_10	Sumkalar	Сумки	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_11	Sharflar	Шарфы	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
cat_12	Panolar	Панно	2026-04-28 06:17:52.561992+00	2026-04-28 06:17:52.561992+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, sku, barcode, category_id, description, unit, purchase_price, selling_price, current_quantity, min_quantity, image_placeholder, created_at, updated_at, owner_user_id) FROM stdin;
prod_001	Yog'och qoshiq (katta)	WD-SPO-001	4600000000001	cat_01	Yog'ochdan yasalgan katta oshpaz qoshig'i	dona	8500.00	15000.00	145	20	\N	2025-01-15 00:00:00+00	2025-11-10 00:00:00+00	usr_01
prod_002	Yog'och taxta (naqshli)	WD-CUT-001	4600000000002	cat_01	Naqshli kesish taxtasi	dona	25000.00	45000.00	8	15	\N	2025-02-01 00:00:00+00	2025-11-10 00:00:00+00	usr_01
prod_003	Yog'och quti (kichik)	WD-BOX-001	4600000000003	cat_01	Zargarlik buyumlari uchun yog'och quti	dona	18000.00	32000.00	0	10	\N	2025-02-10 00:00:00+00	2025-11-09 00:00:00+00	usr_01
prod_008	Keramika piyola (ko'k naqsh)	CR-CUP-001	4600000000008	cat_03	An'anaviy o'zbek naqshi bilan bezatilgan piyola	dona	12000.00	22000.00	89	20	\N	2025-01-20 00:00:00+00	2025-11-04 00:00:00+00	usr_01
prod_015	Doppi (qora)	MC-SKC-001	\N	cat_05	\N	dona	35000.00	65000.00	56	15	\N	2025-03-20 00:00:00+00	2025-10-28 00:00:00+00	usr_01
prod_026	Magnit (Registon, kichik)	MG-REG-001	4600000000026	cat_09	Registon suratlari bilan magnit	dona	4500.00	9000.00	320	50	\N	2025-01-10 00:00:00+00	2025-10-17 00:00:00+00	usr_01
prod_029	Teri sumka (qo'l sumkasi)	BG-LTH-001	4600000000029	cat_10	Tabiiy teridan tikilgan qo'l sumkasi	dona	150000.00	270000.00	16	5	\N	2025-04-20 00:00:00+00	2025-10-14 00:00:00+00	usr_01
\.


--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_balances (id, product_id, warehouse_id, quantity, updated_at, created_at) FROM stdin;
sb_001	prod_001	wh_01	100	2025-11-10 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_002	prod_001	wh_02	45	2025-11-10 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_003	prod_002	wh_01	8	2025-11-10 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_004	prod_003	wh_01	0	2025-11-09 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_008	prod_008	wh_01	89	2025-11-04 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_015	prod_015	wh_01	56	2025-10-28 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_010	prod_026	wh_01	200	2025-10-17 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_011	prod_026	wh_02	120	2025-10-17 00:00:00+00	2026-05-02 12:56:04.805277+00
sb_029	prod_029	wh_01	16	2025-10-14 00:00:00+00	2026-05-02 12:56:04.805277+00
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, product_id, warehouse_id, movement_type, quantity, before_quantity, after_quantity, reason, note, created_by, created_at) FROM stdin;
mv_001	prod_001	wh_01	IN	50	95	145	\N	Etkazib beruvchidan qabul qilindi	usr_02	2025-11-10 09:30:00+00
mv_002	prod_026	wh_01	OUT	30	350	320	Sale	Do'konga jo'natildi	usr_03	2025-11-10 11:15:00+00
mv_003	prod_003	wh_01	OUT	5	5	0	Damaged	Zararlangan mahsulotlar olib tashlandi	usr_02	2025-11-09 14:00:00+00
mv_005	prod_015	wh_01	ADJUSTMENT	6	50	56	\N	Inventarizatsiya natijasi	usr_02	2025-11-07 16:30:00+00
mv_007	prod_029	wh_01	OUT	4	20	16	Sale	\N	usr_03	2025-11-05 13:45:00+00
mv_004	prod_008	wh_01	IN	89	0	89	\N	Yangi partiya keldi (corrected: was 100, after_quantity 89)	usr_01	2025-11-08 10:00:00+00
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.warehouses (id, name, location, created_at, updated_at) FROM stdin;
wh_01	Asosiy ombor	Toshkent, Yunusobod tumani	2026-04-28 06:17:52.563778+00	2026-04-28 06:17:52.563778+00
wh_02	Filial ombor	Toshkent, Chilonzor tumani	2026-04-28 06:17:52.563778+00	2026-04-28 06:17:52.563778+00
wh_03	Tranzit ombor	Toshkent, Olmazor tumani	2026-04-28 06:17:52.563778+00	2026-04-28 06:17:52.563778+00
\.


--
-- Name: app_users app_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_pkey PRIMARY KEY (id);


--
-- Name: app_users app_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_users
    ADD CONSTRAINT app_users_username_key UNIQUE (username);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: products products_barcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: stock_balances stock_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_pkey PRIMARY KEY (id);


--
-- Name: stock_balances stock_balances_product_id_warehouse_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_product_id_warehouse_id_key UNIQUE (product_id, warehouse_id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- Name: idx_products_owner_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_owner_user_id ON public.products USING btree (owner_user_id);


--
-- Name: idx_stock_balances_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_balances_product_id ON public.stock_balances USING btree (product_id);


--
-- Name: idx_stock_balances_warehouse_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_balances_warehouse_id ON public.stock_balances USING btree (warehouse_id);


--
-- Name: idx_stock_movements_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_movements_created_by ON public.stock_movements USING btree (created_by);


--
-- Name: idx_stock_movements_product_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_movements_product_id_created_at ON public.stock_movements USING btree (product_id, created_at DESC);


--
-- Name: idx_stock_movements_type_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_movements_type_created_at ON public.stock_movements USING btree (movement_type, created_at DESC);


--
-- Name: idx_stock_movements_warehouse_id_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_movements_warehouse_id_created_at ON public.stock_movements USING btree (warehouse_id, created_at DESC);


--
-- Name: app_users trg_app_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_app_users_updated_at BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: categories trg_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products trg_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: stock_balances trg_stock_balances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_stock_balances_updated_at BEFORE UPDATE ON public.stock_balances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: warehouses trg_warehouses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_warehouses_updated_at BEFORE UPDATE ON public.warehouses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.app_users(id);


--
-- Name: stock_balances stock_balances_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: stock_balances stock_balances_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: stock_movements stock_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.app_users(id);


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- PostgreSQL database dump complete
--

\unrestrict u0esup1j9Zec6zmA6ePM2UY5LVxYjJWnBSconHwzFdFuYDQvLHbSJPL2zuIZadE

