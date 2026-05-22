CREATE TABLE "favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"user_id" text NOT NULL,
	"project_id" text NOT NULL,
	CONSTRAINT "favorites_user_id_project_id_unique" UNIQUE("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "gift_catalog" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"description" text,
	"image_url" varchar(1000),
	"estimated_value" numeric(10, 2),
	"stock_qty" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"project_id" text NOT NULL,
	"file_id" text NOT NULL,
	"media_type_id" text,
	"caption" varchar(300),
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_nearby_places" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"project_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"category" varchar(50) NOT NULL,
	"distance_km" numeric(6, 2),
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "reward_config" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"trigger_event" varchar(50) NOT NULL,
	"reward_type" varchar(50) NOT NULL,
	"gift_id" text,
	"voucher_id" text,
	"cash_amount" numeric(10, 2),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_catalog" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"denomination" numeric(10, 2) NOT NULL,
	"description" text,
	"image_url" varchar(1000),
	"stock_qty" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_layouts" ADD COLUMN "is_dual_key" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "project_layouts" ADD COLUMN "ceiling_height_m" numeric(4, 2);--> statement-breakpoint
ALTER TABLE "project_layouts" ADD COLUMN "furnishing_status" varchar(20) DEFAULT 'UNFURNISHED';--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "land_area_acres" numeric(10, 4);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "booking_fee_bumi" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "sinking_fund_per_sqft" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_gated_community" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "green_certification" varchar(100);--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD COLUMN "gift_id" text;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD COLUMN "voucher_id" text;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD COLUMN "reward_config_id" text;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD COLUMN "fulfilled_at" timestamp;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD COLUMN "fulfilled_by" text;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "referral_tiers" ADD COLUMN "reward_type" varchar(50) DEFAULT 'VOUCHER' NOT NULL;--> statement-breakpoint
ALTER TABLE "referral_tiers" ADD COLUMN "gift_id" text;--> statement-breakpoint
ALTER TABLE "referral_tiers" ADD COLUMN "voucher_id" text;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_type_id_media_types_id_fk" FOREIGN KEY ("media_type_id") REFERENCES "public"."media_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_nearby_places" ADD CONSTRAINT "project_nearby_places_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_config" ADD CONSTRAINT "reward_config_gift_id_gift_catalog_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_config" ADD CONSTRAINT "reward_config_voucher_id_voucher_catalog_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fav_user_idx" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pm_project_idx" ON "project_media" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pnp_project_idx" ON "project_nearby_places" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pnp_category_idx" ON "project_nearby_places" USING btree ("project_id","category");--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_gift_id_gift_catalog_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_voucher_id_voucher_catalog_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_reward_config_id_reward_config_id_fk" FOREIGN KEY ("reward_config_id") REFERENCES "public"."reward_config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_fulfilled_by_users_id_fk" FOREIGN KEY ("fulfilled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_tiers" ADD CONSTRAINT "referral_tiers_gift_id_gift_catalog_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_tiers" ADD CONSTRAINT "referral_tiers_voucher_id_voucher_catalog_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pl_project_idx" ON "project_layouts" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pp_project_idx" ON "project_phases" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pt_project_idx" ON "project_towers" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pt_phase_idx" ON "project_towers" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "u_project_idx" ON "units" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "u_tower_idx" ON "units" USING btree ("tower_id");--> statement-breakpoint
CREATE INDEX "u_layout_idx" ON "units" USING btree ("layout_id");--> statement-breakpoint
CREATE INDEX "u_booking_status_idx" ON "units" USING btree ("booking_status_id");--> statement-breakpoint
CREATE INDEX "u_tower_floor_stack_idx" ON "units" USING btree ("tower_id","floor","stack");--> statement-breakpoint
ALTER TABLE "project_layouts" ADD CONSTRAINT "project_layouts_project_id_code_unique" UNIQUE("project_id","code");--> statement-breakpoint
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_name_unique" UNIQUE("project_id","name");--> statement-breakpoint
ALTER TABLE "project_phases" ADD CONSTRAINT "project_phases_project_id_phase_code_unique" UNIQUE("project_id","phase_code");--> statement-breakpoint
ALTER TABLE "project_towers" ADD CONSTRAINT "project_towers_project_id_tower_number_unique" UNIQUE("project_id","tower_number");--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_project_id_unit_no_unique" UNIQUE("project_id","unit_no");