CREATE TABLE "pricing_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"project_id" text NOT NULL,
	"phase_id" text,
	"tower_id" text,
	"layout_id" text,
	"buyer_type_id" text,
	"view_key" varchar(100),
	"spa_price_min" numeric(15, 2),
	"spa_price_max" numeric(15, 2),
	"nett_price_min" numeric(15, 2),
	"nett_price_max" numeric(15, 2),
	"rebate_percent_total" numeric(6, 2),
	"snapshot_date" date NOT NULL,
	"source_note" text
);
--> statement-breakpoint
CREATE TABLE "project_quota_allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"project_id" text NOT NULL,
	"phase_id" text,
	"quota_type" varchar(30) NOT NULL,
	"total_units" integer DEFAULT 0 NOT NULL,
	"sold_units" integer DEFAULT 0 NOT NULL,
	"available_units" integer DEFAULT 0 NOT NULL,
	"snapshot_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_regulatory_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"project_id" text NOT NULL,
	"developer_company_reg_no" varchar(100),
	"developer_license_no" varchar(100),
	"developer_license_valid_from" date,
	"developer_license_valid_to" date,
	"advertising_permit_no" varchar(100),
	"advertising_permit_valid_from" date,
	"advertising_permit_valid_to" date,
	"is_hda_covered" boolean DEFAULT false NOT NULL,
	"spa_schedule_code" varchar(20),
	"teduh_project_code" varchar(100),
	"teduh_last_verified_at" timestamp,
	CONSTRAINT "project_regulatory_profiles_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "unit_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"unit_id" text NOT NULL,
	"from_status_id" text,
	"to_status_id" text NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by_id" text,
	"source_note" text
);
--> statement-breakpoint
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_tower_id_project_towers_id_fk" FOREIGN KEY ("tower_id") REFERENCES "public"."project_towers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_layout_id_project_layouts_id_fk" FOREIGN KEY ("layout_id") REFERENCES "public"."project_layouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_buyer_type_id_buyer_types_id_fk" FOREIGN KEY ("buyer_type_id") REFERENCES "public"."buyer_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_quota_allocations" ADD CONSTRAINT "project_quota_allocations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_quota_allocations" ADD CONSTRAINT "project_quota_allocations_phase_id_project_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."project_phases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_regulatory_profiles" ADD CONSTRAINT "project_regulatory_profiles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_status_history" ADD CONSTRAINT "unit_status_history_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_status_history" ADD CONSTRAINT "unit_status_history_from_status_id_booking_statuses_id_fk" FOREIGN KEY ("from_status_id") REFERENCES "public"."booking_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_status_history" ADD CONSTRAINT "unit_status_history_to_status_id_booking_statuses_id_fk" FOREIGN KEY ("to_status_id") REFERENCES "public"."booking_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_status_history" ADD CONSTRAINT "unit_status_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ps_project_idx" ON "pricing_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "ps_phase_idx" ON "pricing_snapshots" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "ps_tower_idx" ON "pricing_snapshots" USING btree ("tower_id");--> statement-breakpoint
CREATE INDEX "ps_layout_idx" ON "pricing_snapshots" USING btree ("layout_id");--> statement-breakpoint
CREATE INDEX "ps_snapshot_date_idx" ON "pricing_snapshots" USING btree ("snapshot_date");--> statement-breakpoint
CREATE INDEX "ps_query_idx" ON "pricing_snapshots" USING btree ("project_id","phase_id","tower_id","layout_id","buyer_type_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "pqa_project_idx" ON "project_quota_allocations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "pqa_phase_idx" ON "project_quota_allocations" USING btree ("phase_id");--> statement-breakpoint
CREATE INDEX "pqa_quota_snapshot_idx" ON "project_quota_allocations" USING btree ("project_id","phase_id","quota_type","snapshot_date");--> statement-breakpoint
CREATE INDEX "prp_project_idx" ON "project_regulatory_profiles" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "prp_hda_coverage_idx" ON "project_regulatory_profiles" USING btree ("is_hda_covered");--> statement-breakpoint
CREATE INDEX "ush_unit_idx" ON "unit_status_history" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "ush_changed_at_idx" ON "unit_status_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX "ush_unit_changed_at_idx" ON "unit_status_history" USING btree ("unit_id","changed_at");