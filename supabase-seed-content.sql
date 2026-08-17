/* builds: nothing to seed */
insert into public.services (id, title, division, icon, description, image, anchor, active, featured, sort_order, created_at, updated_at) values
  ('s_ecu-calibration-remapping', 'ECU Calibration & Remapping', 'Performance', 'ecu', 'Specialising in ECU calibration across a wide range of manufacturers. Every map is optimised for boost, air/fuel ratio, ignition timing and torque management etc. - balancing real performance gains with long-term reliability.', '', 'ecu-remapping', true, true, 0, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.743Z'),
  ('s_dastek-unichip-installation', 'Dastek Unichip Installation', 'Performance', 'ecu', 'Advanced accredited dealer with 20+ years'' experience in installation and tuning across various manufacturer platforms - covering plug-and-play, warranty-conscious ECU control and options such as derating, road-speed regulation or removal, immobiliser functions and 5-map switching solutions.', '', 'unichip', true, true, 1, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.743Z'),
  ('s_dyno-validation', 'Dyno Validation', 'Performance', 'dyno', 'In-house loading and inertia runs with calibrated power readings. Real-time EGT, AFR, wheel Nm, speed, kW, boost and many more monitoring readings available.', '', 'dyno', true, true, 2, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.743Z'),
  ('s_performance-exhaust-systems', 'Performance Exhaust Systems', 'Performance', 'exhaust', 'High-quality, custom-manufactured performance exhausts - from bolt-on systems to bespoke downpipes. Precision-welded to an exacting standard for a premium finish, cleaner flow and an unmistakable tone.', '', 'exhaust', true, true, 3, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.743Z'),
  ('s_turbo-upgrades', 'Turbo Upgrades', 'Performance', 'turbo', 'Upgraded turbochargers and supporting hardware for more boost and stronger response.', '', 'conversions', true, false, 4, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.743Z'),
  ('s_hybrid-turbo-conversions', 'Hybrid Turbo Conversions', 'Performance', 'turbo', 'Hybrid and big-turbo conversions for a serious step up in performance.', '', 'conversions', true, false, 5, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_intercooler-upgrades', 'Intercooler Upgrades', 'Performance', 'intercooler', 'Bolt-on, larger and more efficient intercoolers - up to 200% capacity increase - for cooler charge air, delivering safer, more consistent power. Custom-built intercoolers to suit performance-specific applications.', '', '', true, false, 6, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_fuel-system-upgrades', 'Fuel System Upgrades', 'Performance', 'additive', 'Fuel lines, pumps and injectors to safely support higher fuelling demands. Catering for various fuels such as ethanol, methanol and race fuels.', '', '', true, false, 7, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_economy-tuning', 'Economy Tuning', 'Performance', 'gauge', 'We provide economy tunes that save fuel while still adding power to your vehicle.', '', '', true, false, 8, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_intake-systems', 'Intake Systems', 'Performance', 'intake', 'Performance cold-air induction and intake manifold upgrades for improved airflow.', '', '', true, false, 9, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_performance-diagnostics', 'Performance Diagnostics', 'Performance', 'diagnostics', 'Data logging and analysis to verify tuned setups, ensuring safety and reliability. Fault finding to keep tuned setups running safely and reliably.', '', '', true, false, 10, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_custom-performance-packages', 'Custom Performance Packages', 'Performance', 'star', 'Tailored builds from mild street setups to maximum-power projects.', '', '', true, false, 11, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_minor-services', 'Minor Services', 'Services & Repairs', 'wrench', 'Regular servicing using quality oils, filters and manufacturer recommendations.', '', '', true, true, 12, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_major-services', 'Major Services', 'Services & Repairs', 'wrench', 'Comprehensive scheduled maintenance including all required inspections and replacements.', '', '', true, true, 13, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_mechanical-repairs', 'Mechanical Repairs', 'Services & Repairs', 'cog', 'Professional repairs for engine, suspension, braking and drivetrain components.', '', '', true, false, 14, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_diagnostics', 'Diagnostics', 'Services & Repairs', 'diagnostics', 'Advanced fault finding using professional diagnostic equipment and dyno diagnostics.', '', '', true, false, 15, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_brake-services', 'Brake Services', 'Services & Repairs', 'gauge', 'Inspection, replacement and maintenance of braking systems.', '', '', true, false, 16, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_cooling-systems', 'Cooling Systems', 'Services & Repairs', 'bolt', 'Radiators, auxiliary coolant systems, thermo-regulating systems and overheating diagnosis.', '', '', true, false, 17, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_detailing-services', 'Detailing Services', 'Services & Repairs', 'sparkles', 'All vehicles are washed after a service before leaving the workshop - tyre shine and window washer fluid included. Optional extras: polishing, glazing, ceramic coating, nano coating, engine bay and undercarriage wash.', '', '', true, false, 18, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('s_vehicle-inspections', 'Vehicle Inspections', 'Services & Repairs', 'shield', 'Pre-purchase inspections, safety inspections and general vehicle health checks.', '', '', true, false, 19, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z')
on conflict (id) do update set
  title = excluded.title,
  division = excluded.division,
  icon = excluded.icon,
  description = excluded.description,
  image = excluded.image,
  anchor = excluded.anchor,
  active = excluded.active,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into public.stages (id, label, name, tagline, description, requirements, benefits, note, icon, active, sort_order, created_at, updated_at) values
  ('st_stage-1', '1', 'Stage 1', 'Software Only', 'A pure ECU or TCU software remap - safe, reliable gains with no hardware changes required.', '["Basic ECU software / remap","No hardware upgrades required"]'::jsonb, '["More Power","Better Response","Improved Driveability","Reliable Performance","Improved Fuel Consumption"]'::jsonb, '', 'ecu', true, 0, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('st_stage-1-plus', '1+', 'Stage 1+', 'Light Performance Upgrades', 'Light bolt-on hardware paired with customised tune adjustments, creating a Stage 1+ tune for a noticeable step up.', '["Decat or downpipe","Optional upgraded exhaust system","Optional intake / induction","Optional Stage 1 TCU (gearbox) tune"]'::jsonb, '["More Power","Better Response","Improved Driveability","Reliable Performance","Improved Fuel Consumption"]'::jsonb, '', 'exhaust', true, 1, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('st_stage-2', '2', 'Stage 2', 'Intermediate Performance Build', 'A balanced intermediate build - supporting hardware plus a Stage 2 software tune.', '["Downpipe","Intake / induction upgrade","Exhaust mid-box delete or full upgraded exhaust","Intercooler upgrade or Water-Methanol Injection (WMI)","Stage 2 ECU software tune","Optional Stage 1 or 2 TCU tune"]'::jsonb, '["More Power","Better Response","Improved Driveability","Reliable Performance"]'::jsonb, '', 'dyno', true, 2, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('st_stage-2-plus', '2+', 'Stage 2+', 'Advanced Performance Setup', 'Advanced setup consisting of Stage 2 hardware but introducing a hybrid turbo with matched Stage 2+ software.', '["Downpipe","Intake / induction upgrade","Full upgraded exhaust","Boost Pipes","Intercooler upgrade","Water-Methanol Injection (WMI)","Hybrid turbos","Stage 2+ ECU software tune","Supportive ECU tune"]'::jsonb, '["More Power","Better Response","Improved Driveability","Reliable Performance"]'::jsonb, '', 'turbo', true, 3, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z'),
  ('st_stage-3', '3', 'Stage 3', 'High Performance / Maximum Power Build', 'Our maximum-power build - full supporting hardware, a bigger turbo and optional forged internals.', '["Downpipe and full exhaust system","Intercooler upgrade","Water-Methanol Injection (WMI)","Upgraded larger / bigger turbo","Optional forged engine internals","Stage 3 ECU software tune","Stage 2+ / 3 TCU software","Optional performance modifications"]'::jsonb, '["Maximum Power","Track-Like Response","Maintaining Driveability","High RPM Power Band","Race Car Feel"]'::jsonb, 'The above are the basic requirements for a Stage 3 package - additional upgrades and modifications can be added.', 'stage', true, 4, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.744Z')
on conflict (id) do update set
  label = excluded.label,
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  requirements = excluded.requirements,
  benefits = excluded.benefits,
  note = excluded.note,
  icon = excluded.icon,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into public.products (id, name, range, type, description, size, price, image, in_stock, active, sort_order, created_at, updated_at) values
  ('p_nf-ultra-race-fuel-concentrate', 'NF Ultra Race Fuel Concentrate', 'NF Additives', 'Fuel enhancer', '', '', 0, '', true, true, 0, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-petrol-injector-cleaner-3-in-1', 'NF Petrol Injector Cleaner 3-in-1', 'NF Additives', 'Injector cleaner', '', '', 0, '', true, true, 1, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-fuel-enhancer', 'NF Fuel Enhancer', 'NF Additives', 'Fuel enhancer', '', '', 0, '', true, true, 2, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-petrol-7-in-1-service', 'NF Petrol 7-in-1 Service', 'NF Additives', 'Service treatment', '', '', 0, '', true, true, 3, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-race-octane-booster', 'NF Race Octane Booster', 'NF Additives', 'Octane booster', '', '', 0, '', true, true, 4, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-super-street-octane-booster', 'NF Super Street Octane Booster', 'NF Additives', 'Octane booster', '', '', 0, '', true, true, 5, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-sport-octane-booster', 'NF Sport Octane Booster', 'NF Additives', 'Octane booster', '', '', 0, '', true, true, 6, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-heavy-duty-fuel-guard', 'NF Heavy Duty Fuel Guard', 'NF Additives', 'Protection additive', '', '', 0, '', true, true, 7, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-diesel-booster', 'NF Diesel Booster', 'NF Additives', 'Fuel enhancer', '', '', 0, '', true, true, 8, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-cvt-atf-treatment', 'NF CVT & ATF Treatment', 'NF Additives', 'Transmission treatment', '', '', 0, '', true, true, 9, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-outback-guard', 'NF Outback Guard', 'NF Additives', 'Protection additive', '', '', 0, '', true, true, 10, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-diesel-injector-cleaner-3-in-1', 'NF Diesel Injector Cleaner 3-in-1', 'NF Additives', 'Injector cleaner', '', '', 0, '', true, true, 11, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('p_nf-diesel-4-in-1-service', 'NF Diesel 4-in-1 Service', 'NF Additives', 'Service treatment', '', '', 0, '', true, true, 12, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z')
on conflict (id) do update set
  name = excluded.name,
  range = excluded.range,
  type = excluded.type,
  description = excluded.description,
  size = excluded.size,
  price = excluded.price,
  image = excluded.image,
  in_stock = excluded.in_stock,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into public.brands (id, name, logo, url, active, sort_order, created_at, updated_at) values
  ('br_dastek-unichip', 'Dastek Unichip', '', '', true, 0, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_alientech', 'Alientech', '', '', true, 1, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_de-graaf-exhausts', 'De Graaf Exhausts', '', '', true, 2, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_ross-tech-vcds', 'Ross-Tech VCDS', '', '', true, 3, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_viper-exhausts', 'Viper Exhausts', '', '', true, 4, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_mpps', 'MPPS', '', '', true, 5, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_cirrus-intercoolers', 'Cirrus Intercoolers', '', '', true, 6, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_dimsport', 'DimSport', '', '', true, 7, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_tactrix', 'Tactrix', '', '', true, 8, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_tunerpro', 'TunerPro', '', '', true, 9, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_ucm-100', 'UCM 100', '', '', true, 10, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_toyota-techstream', 'Toyota Techstream', '', '', true, 11, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_mmc-flash', 'MMC Flash', '', '', true, 12, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_autotuner', 'AutoTuner', '', '', true, 13, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_winols-5', 'WinOLS 5', '', '', true, 14, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_bflash', 'bFlash', '', '', true, 15, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_cmd', 'CMD', '', '', true, 16, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_bitbox', 'BitBox', '', '', true, 17, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_tunezilla', 'TuneZilla', '', '', true, 18, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_bnb-exhausts', 'BNB Exhausts', '', '', true, 19, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_f1-x', 'F1-X', '', '', true, 20, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('br_tnt', 'TNT', '', '', true, 21, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z')
on conflict (id) do update set
  name = excluded.name,
  logo = excluded.logo,
  url = excluded.url,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into public.faqs (id, question, answer, category, featured, active, sort_order, created_at, updated_at) values
  ('f_what-makes-venom-racing-different-from-a-g', 'What makes Venom Racing different from a general workshop?', 'Venom Racing stands apart through custom dyno tuning, advanced diagnostics, complete performance builds and personal customer service, all led by an experienced master tuner. Unlike conventional workshops that rely on generic solutions, every vehicle is assessed, tested and calibrated according to its specific hardware, fuel, condition and performance goals to deliver safe, reliable and measurable results.', 'General', false, true, 0, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_what-are-your-operating-hours', 'What are your operating hours?', 'We''re open Monday to Friday, 08:00 to 17:00. Get in touch via phone or WhatsApp to book a consultation.', 'General', false, true, 1, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_will-tuning-void-my-vehicle', 'Will tuning void my vehicle''s warranty?', 'A Dastek Unichip is a piggyback system that doesn''t alter the factory ECU file, which is why it''s a common choice for warranty-sensitive vehicles. Direct ECU remaps are a separate discussion - we''ll talk you through the trade-offs for your specific vehicle at consultation.', 'ECU Tuning & Unichip', true, true, 2, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_what-is-the-5-map-switch-system', 'What is the 5-map switch system?', 'Our Unichip installs include an in-cab switch giving you up to 5 tuned profiles: Immobiliser, Stock, Towing, Consumption, and Performance - letting you match engine behaviour to what you’re doing that day.', 'ECU Tuning & Unichip', true, true, 3, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_which-vehicle-types-does-dastek-unichip-tu', 'Which vehicle types does Dastek Unichip tuning suit?', 'We cover most manufacturers from classic to modern vehicle platforms, from utility vehicles to supercars. Get in touch to confirm compatibility for your vehicle.', 'ECU Tuning & Unichip', true, true, 4, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_do-you-build-custom-performance-exhaust-sy', 'Do you build custom performance exhaust systems?', 'Yes - we manufacture high-quality performance exhaust systems in-house, from bolt-on systems to bespoke downpipes and headers, precision-welded to an exacting standard for a premium finish and cleaner flow.', 'Fabrication & Conversions', false, true, 5, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_do-you-do-full-engine-conversions', 'Do you do full engine conversions?', 'Yes - including fully forged engine conversions, custom turbocharger installations, and structural welding for non-standard engine builds.', 'Fabrication & Conversions', false, true, 6, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_how-long-does-a-typical-installation-take', 'How long does a typical installation take?', 'Turnaround depends on the service - hardware installs and dyno tuning are usually same-day, while fabrication work varies with complexity. We''ll confirm a timeline at your consultation.', 'Booking & Process', true, true, 7, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('f_how-do-i-get-a-quote', 'How do I get a quote?', 'Use the quote request form on our Contact page, or reach us directly by phone or WhatsApp - we''ll ask a few questions about your vehicle and goals before booking an inspection.', 'Booking & Process', false, true, 8, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z')
on conflict (id) do update set
  question = excluded.question,
  answer = excluded.answer,
  category = excluded.category,
  featured = excluded.featured,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

insert into public.testimonials (id, name, subject, rating, review, photo, featured, source, date_text, sort_order, created_at, updated_at) values
  ('t_william-nalane', 'William Nalane', '', 5, 'Perfect service and quality work. No return job. Friendly and good customer care. Most important is the honesty.', '', true, 'Google', '5 days ago', 0, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_newqishke-du-preez', 'Newqishke du Preez', '', 5, 'Friendly & excellent service!', '', false, 'Google', '3 weeks ago', 1, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_robert-wagner', 'Robert Wagner', 'Servicing and detailing', 5, 'Always very good service and extremely clean workmanship. Very knowledgeable, no problem unsolvable. Very lucky to know where to take my Hilux or any other car for anything, even just a good wash and detailing!', '', true, 'Google', 'a month ago', 2, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_george-nel', 'George Nel', '', 5, 'I will always come to Drikus. Moerse satisfied. Thank you very much.', '', false, 'Google', 'a month ago', 3, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_forthefairies', 'ForTheFairies', 'Vehicle service', 5, 'Had my car serviced here. First time I''m happy with a service and it didn''t take an entire day. The staff is super friendly and on par with their servicing. Pricing is perfect too.', '', false, 'Google', 'a month ago', 4, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_bertus-swart', 'Bertus Swart', '', 5, 'Excellent service, professional workmanship, and the best customer service I''ve received - all delivered with a smile. Highly recommended!', '', true, 'Google', 'a month ago', 5, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_chane-steenberg', 'Chane Steenberg', '', 5, 'Very friendly service. Keeps in contact. Would 100% refer.', '', false, 'Google', '4 months ago', 6, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_ndumiso-mthethwa', 'Ndumiso Mthethwa', 'Conversion, respray and servicing', 5, 'They are the best in Witbank - car conversion, body respray, servicing the car. Top notch. Big up.', '', false, 'Google', '4 months ago', 7, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_pet-kgwedi', 'Pet Kgwedi', 'Performance diagnostics', 5, 'My car had performance issues, so I decided to take it to Venom for a checkup. Through their intensive diagnostic systems they managed to pick up the problem and got it fixed beyond perfection, I must say. Probably the neatest dealership in town. They just don''t disappoint.', '', true, 'Google', '6 months ago', 8, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_mpho-calvin-mokhethea', 'Mpho Calvin Mokhethea', 'Annual service - Mazda CX-5', 5, 'Took my Mazda CX-5 yesterday for an annual service - wow, Venom outdid themselves. Thank you guys for treating my car with care… it runs like new.', '', false, 'Google', '11 months ago', 9, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z'),
  ('t_dj-slash-productions-sa', 'DJ Slash Productions SA', 'Ford Focus ST225 repairs and fabrication', 5, 'Yet again, Dricus and the team have outdone themselves. I can''t thank you enough for treating my pride and joy as if it was my own. My Focus 225ST had a bad coolant leak, which they found by the Welsh plugs. They went further to find the coil pack wires were damaged and the intake pipe had issues, and sorted some leaks. On top of that they did a Y-piece straight pipe. One can see why this is a 5-star, RMI-Approved workshop. Keep up the good work - see you again soon!', '', true, 'Google', 'a year ago', 10, '2026-08-17T08:03:23.240Z', '2026-08-17T08:03:25.745Z')
on conflict (id) do update set
  name = excluded.name,
  subject = excluded.subject,
  rating = excluded.rating,
  review = excluded.review,
  photo = excluded.photo,
  featured = excluded.featured,
  source = excluded.source,
  date_text = excluded.date_text,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;

/* offers: nothing to seed */
insert into public.site_settings (key, value) values
  ('homepage', '{"heroTitle":"Where Performance Meets Precision.","heroSubtitle":"An RMI Accredited workshop and advanced accredited Dastek Unichip dealer in eMalahleni. In-house master tuner offering dyno and V-Box proven ECU tuning to ensure maximum performance, custom exhaust fabrication and precision automotive repairs.","heroBadge":"RMI Accredited · Official Dastek Unichip Dealer","btn1Text":"Explore Services","btn1Link":"performance.html","btn2Text":"Request Quote","btn2Link":"contact.html","heroImage":"","featuredIds":[],"featuredTitle":"Featured builds","featuredSub":"A selection of recent work from the Venom Racing workshop.","aboutTitle":"Precision Tuning, Proven On The Dyno","aboutText":"Venom Racing is a performance workshop based in eMalahleni, built on preferred performance brands including Dastek Unichip, De Graaf Exhaust Systems, BNB Exhausts, Viper Performance Exhausts and Cirrus Performance Intercoolers, plus in-house fabrication. Every calibration is professionally validated on the dyno or V-Box, proven to ensure maximum performance, safety and long-term reliability.","aboutImage":"","stats":[{"label":"Years of experience","value":"26+"},{"label":"Unichip experience","value":"20+ years"},{"label":"Accreditation","value":"RMI"},{"label":"Validation","value":"Dyno & V-Box"}],"ctaTitle":"Not sure which stage is right for your vehicle?","ctaText":"Tell us about your vehicle and what you are looking to achieve and we will get back to you to schedule a consultation.","ctaBtnText":"Book a Consultation","ctaBtnLink":"contact.html","banners":[]}'::jsonb),
  ('contact', '{"phone":"082 852 0680","phone2":"082 512 6166","whatsapp":"+27 82 852 0680","email":"venom@venomracing.co.za","email2":"dyno@venomracing.co.za","address":"58 Industrial Crescent, eMalahleni, 1034, Mpumalanga","mapsUrl":"https://www.google.com/maps?q=58+Industrial+Crescent,+eMalahleni,+1034,+South+Africa","tuningPortal":"https://venomperformance.tuningfileportal.com/","hours":[{"day":"Monday","open":"08:00","close":"17:00","closed":false},{"day":"Tuesday","open":"08:00","close":"17:00","closed":false},{"day":"Wednesday","open":"08:00","close":"17:00","closed":false},{"day":"Thursday","open":"08:00","close":"17:00","closed":false},{"day":"Friday","open":"08:00","close":"17:00","closed":false},{"day":"Saturday","open":"","close":"","closed":true},{"day":"Sunday","open":"","close":"","closed":true}],"social":{"facebook":"https://www.facebook.com/share/18gd3wJBhW/?mibextid=wwXIfr","instagram":"https://www.instagram.com/venom_racing_30?igsh=MWx6eHptaXpyZ3AwMQ==","tiktok":"https://www.tiktok.com/@venomracing01?_r=1&_t=ZS-97rB1zXW0KD","youtube":"","x":"","google":"https://maps.app.goo.gl/HpCtPxiZec25Rqi1A?g_st=ic"}}'::jsonb),
  ('appearance', '{"primary":"#0a0a0b","accent":"#b3121f","success":"#2a9d6f","heading":"Barlow Condensed","bodyFont":"Inter","radius":16,"btnStyle":"rounded","btnShadow":true,"logo":"","favicon":"","heroBg":"","darkSite":true,"tagline":"Where Performance Meets Precision"}'::jsonb),
  ('analytics', '{"visitors7":[0,0,0,0,0,0,0],"visitors30Total":0,"visitorsPrev":0,"whatsappClicks":0,"phoneCalls":0,"formSubmits":0,"buildViews":0,"devices":{"Mobile":0,"Desktop":0,"Tablet":0},"sources":{}}'::jsonb),
  ('gallery', '{"list":[]}'::jsonb),
  ('meta', '{"version":1,"createdAt":1786953803240,"lastSaved":1786953803240,"siteLive":true}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();
