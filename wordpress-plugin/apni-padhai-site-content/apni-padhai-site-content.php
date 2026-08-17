<?php
/**
 * Plugin Name: Apni Padhai Site Content
 * Description: Manage the content shown on the Apni Padhai website — hero slides, testimonials, FAQs and courses — with full create / edit / reorder / delete, and images picked straight from the WordPress Media Library. Each item is a post you manage under its own menu in wp-admin. The website reads it automatically.
 * Version: 1.0.0
 * Author: Apni Padhai
 * License: GPL-2.0-or-later
 * Text Domain: apni-padhai
 *
 * @package ApniPadhai
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'APSC_VERSION', '1.0.0' );
define( 'APSC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Register the content post types.
 */
function apsc_register_post_types() {
	$types = array(
		'ap_hero'        => array(
			'singular' => 'Hero Slide',
			'plural'   => 'Hero Slides',
			'icon'     => 'dashicons-star-filled',
			'position' => 26,
			'supports' => array( 'title', 'page-attributes' ),
		),
		'ap_testimonial' => array(
			'singular' => 'Testimonial',
			'plural'   => 'Testimonials',
			'icon'     => 'dashicons-format-quote',
			'position' => 27,
			'supports' => array( 'title', 'editor', 'page-attributes' ),
		),
		'ap_faq'         => array(
			'singular' => 'FAQ',
			'plural'   => 'FAQs',
			'icon'     => 'dashicons-editor-help',
			'position' => 28,
			'supports' => array( 'title', 'editor', 'page-attributes' ),
		),
		'ap_course'      => array(
			'singular' => 'Course',
			'plural'   => 'Courses',
			'icon'     => 'dashicons-welcome-learn-more',
			'position' => 29,
			'supports' => array( 'title', 'editor', 'page-attributes' ),
		),
		'ap_coupon'      => array(
			'singular' => 'Coupon',
			'plural'   => 'Coupons',
			'icon'     => 'dashicons-tickets-alt',
			'position' => 30,
			'supports' => array( 'title', 'page-attributes' ),
		),
	);

	foreach ( $types as $type => $args ) {
		$lower = strtolower( $args['plural'] );
		$labels = array(
			'name'               => $args['plural'],
			'singular_name'      => $args['singular'],
			'add_new'            => 'Add New',
			'add_new_item'       => 'Add New ' . $args['singular'],
			'edit_item'          => 'Edit ' . $args['singular'],
			'new_item'           => 'New ' . $args['singular'],
			'view_item'          => 'View ' . $args['singular'],
			'search_items'       => 'Search ' . $args['plural'],
			'not_found'          => 'No ' . $lower . ' found',
			'not_found_in_trash' => 'No ' . $lower . ' found in Trash',
			'items_list'         => $args['plural'],
		);

		register_post_type(
			$type,
			array(
				'labels'             => $labels,
				'public'             => true,
				'publicly_queryable' => false,
				'show_ui'            => true,
				'show_in_menu'       => true,
				'show_in_rest'       => true,
				'menu_icon'          => $args['icon'],
				'menu_position'      => $args['position'],
				'supports'           => $args['supports'],
				'has_archive'        => false,
				'rewrite'            => false,
				'query_var'          => false,
			)
		);
	}
}
add_action( 'init', 'apsc_register_post_types' );

/**
 * Field definitions per post type.
 * The "title" and main editor are provided by WordPress itself.
 *
 * @return array<string, array<string, array<string, mixed>>>
 */
function apsc_field_definitions() {
	return array(
		'ap_hero'        => array(
			'highlight' => array(
				'label' => 'Highlight (gold word inside the title)',
				'type'  => 'text',
				'hint'  => 'A word from the title that will be shown in gold. Leave empty to show the plain title.',
			),
			'subtitle'  => array(
				'label' => 'Subtitle',
				'type'  => 'textarea',
			),
		),
		'ap_testimonial' => array(
			'exam'   => array(
				'label' => 'Exam',
				'type'  => 'text',
				'hint'  => 'e.g. RAS 2021',
			),
			'rank'   => array(
				'label' => 'Rank (optional)',
				'type'  => 'text',
			),
			'city'   => array(
				'label' => 'City',
				'type'  => 'text',
			),
			'rating' => array(
				'label'   => 'Rating',
				'type'    => 'select',
				'options' => array( '5', '4', '3', '2', '1' ),
				'default' => '5',
			),
			'photo'  => array(
				'label' => 'Photo',
				'type'  => 'image',
				'hint'  => 'Choose a photo from the Media Library (optional).',
			),
		),
		'ap_faq'         => array(
			'category' => array(
				'label'   => 'Category',
				'type'    => 'datalist',
				'options' => array(
					'Courses & Test Series',
					'Payments & Refunds',
					'Books',
					'Account & App',
					'Orders & Delivery',
				),
				'default' => 'Courses & Test Series',
			),
		),
		'ap_course'      => array(
			'url'      => array(
				'label' => 'Enroll URL',
				'type'  => 'url',
				'hint'  => 'Link students click to enroll (AppX / Khabri / etc.).',
			),
			'tagline'  => array(
				'label' => 'Tagline',
				'type'  => 'text',
				'hint'  => 'Short line shown under the title, e.g. "New Batch 2026".',
			),
			'tag'      => array(
				'label' => 'Badge text (optional)',
				'type'  => 'text',
				'hint'  => 'e.g. "New Batch" or "Most Popular".',
			),
			'type'     => array(
				'label'   => 'Type',
				'type'    => 'text',
				'default' => 'Online Batch',
				'hint'    => 'e.g. Online Batch, Test Series, Recorded.',
			),
			'image'    => array(
				'label' => 'Course image',
				'type'  => 'image',
				'hint'  => 'Choose an image from the Media Library.',
			),
			'features' => array(
				'label' => 'Features (one per line)',
				'type'  => 'textarea',
				'hint'  => 'Each line becomes a small tag on the course card.',
			),
		),
		'ap_coupon'      => array(
			'type'   => array(
				'label'   => 'Discount type',
				'type'    => 'select',
				'options' => array(
					array( 'value' => 'percent', 'label' => 'Percentage (%)' ),
					array( 'value' => 'flat', 'label' => 'Flat amount (₹)' ),
				),
				'default' => 'percent',
			),
			'value'  => array(
				'label'   => 'Discount value',
				'type'    => 'text',
				'default' => '0',
				'hint'    => 'Percent: enter 10 for 10% off. Flat: enter the rupee amount off.',
			),
			'label'  => array(
				'label'   => 'Discount label (shown at checkout)',
				'type'    => 'text',
				'default' => 'Discount',
			),
			'active' => array(
				'label'          => 'Active',
				'type'           => 'checkbox',
				'checkbox_label' => 'This coupon can be used at checkout',
				'default'        => '1',
			),
		),
	);
}

/**
 * Add the meta boxes on each content post type.
 */
function apsc_add_meta_boxes() {
	foreach ( array_keys( apsc_field_definitions() ) as $type ) {
		add_meta_box(
			'apsc_details',
			'Content Details',
			'apsc_render_meta_box',
			$type,
			'normal',
			'high'
		);
		add_meta_box(
			'apsc_help',
			'Apni Padhai — How this works',
			'apsc_render_help_box',
			$type,
			'side'
		);
	}
}
add_action( 'add_meta_boxes', 'apsc_add_meta_boxes' );

/**
 * Render the help meta box.
 */
function apsc_render_help_box( $post ) {
	echo '<p style="margin:0 0 8px;">These items appear on the Apni Padhai website automatically after saving.</p>';
	echo '<p style="margin:0 0 8px;">Use the <strong>Order</strong> number (in the Publish box) to sort items — lower numbers show first.</p>';
	echo '<p style="margin:0;">Images are picked from the WordPress <strong>Media Library</strong>. Books are managed separately under <strong>WooCommerce → Products</strong>.</p>';

	if ( 'ap_coupon' === $post->post_type ) {
		echo '<p style="margin:8px 0 0;">The coupon <strong>title</strong> is the <strong>code</strong> customers enter at checkout, e.g. <strong>AP10</strong>. Set <strong>Active</strong> off to disable a coupon.</p>';
	}
}

/**
 * Render the content-details meta box.
 *
 * @param WP_Post $post Current post.
 */
function apsc_render_meta_box( $post ) {
	wp_nonce_field( 'apsc_save_meta', 'apsc_meta_nonce' );

	$fields = isset( apsc_field_definitions()[ $post->post_type ] )
		? apsc_field_definitions()[ $post->post_type ]
		: array();

	echo '<div class="apsc-fields">';
	foreach ( $fields as $key => $field ) {
		$meta_key = '_apsc_' . $key;
		$value    = get_post_meta( $post->ID, $meta_key, true );
		if ( '' === $value && isset( $field['default'] ) ) {
			$value = $field['default'];
		}
		apsc_field_html( $key, $field, $value );
	}
	echo '</div>';
}

/**
 * Print one field row.
 *
 * @param string               $key   Field key.
 * @param array<string, mixed> $field Field config.
 * @param mixed                $value Current value.
 */
function apsc_field_html( $key, $field, $value ) {
	$meta_key = '_apsc_' . $key;
	$label    = isset( $field['label'] ) ? $field['label'] : $key;
	$hint     = isset( $field['hint'] ) ? $field['hint'] : '';
	$id       = 'apsc-field-' . $key;

	echo '<p class="apsc-field">';
	echo '<label for="' . esc_attr( $id ) . '"><strong>' . esc_html( $label ) . '</strong></label>';

	switch ( $field['type'] ) {
		case 'textarea':
			echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $meta_key ) . '" rows="4" class="large-text">'
				. esc_textarea( (string) $value )
				. '</textarea>';
			break;

		case 'select':
			echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $meta_key ) . '" class="widefat">';
			foreach ( $field['options'] as $option ) {
				if ( is_array( $option ) ) {
					$opt_value = $option['value'];
					$opt_label = $option['label'];
				} else {
					$opt_value = $option;
					$opt_label = $option;
				}
				echo '<option value="' . esc_attr( $opt_value ) . '"'
					. selected( (string) $value, (string) $opt_value, false )
					. '>' . esc_html( $opt_label ) . '</option>';
			}
			echo '</select>';
			break;

		case 'checkbox':
			$checked = '1' === (string) $value ? 'checked="checked"' : '';
			$cb_label = isset( $field['checkbox_label'] ) ? $field['checkbox_label'] : '';
			echo '<input type="hidden" name="' . esc_attr( $meta_key ) . '" value="0" />';
			echo '<label><input type="checkbox" name="' . esc_attr( $meta_key ) . '" value="1" ' . $checked . ' /> '
				. esc_html( $cb_label ) . '</label>';
			break;

		case 'datalist':
			echo '<input type="text" id="' . esc_attr( $id ) . '" name="' . esc_attr( $meta_key ) . '" value="'
				. esc_attr( (string) $value ) . '" class="widefat" list="apsc-faq-categories" />';
			echo '<datalist id="apsc-faq-categories">';
			foreach ( $field['options'] as $option ) {
				echo '<option value="' . esc_attr( $option ) . '"></option>';
			}
			echo '</datalist>';
			break;

		case 'image':
			apsc_image_field_html( $meta_key, (string) $value );
			break;

		default:
			$input_type = 'url' === $field['type'] ? 'url' : 'text';
			echo '<input type="' . esc_attr( $input_type ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( $meta_key )
				. '" value="' . esc_attr( (string) $value ) . '" class="widefat" />';
			break;
	}

	if ( $hint ) {
		echo '<span class="description">' . esc_html( $hint ) . '</span>';
	}
	echo '</p>';
}

/**
 * Print a media-library image field.
 *
 * @param string $meta_key Field name.
 * @param string $value    Current image URL.
 */
function apsc_image_field_html( $meta_key, $value ) {
	echo '<div class="apsc-image-field">';
	echo '<input type="hidden" name="' . esc_attr( $meta_key ) . '" value="' . esc_attr( $value ) . '" />';
	if ( $value ) {
		echo '<img class="apsc-preview" src="' . esc_url( $value ) . '" alt="" />';
	} else {
		echo '<img class="apsc-preview" src="" alt="" style="display:none;" />';
	}
	echo '<div>';
	echo '<button type="button" class="button apsc-image-upload">Choose from Media Library</button> ';
	echo '<button type="button" class="button apsc-image-remove">Remove</button>';
	echo '</div>';
	echo '</div>';
}

/**
 * Save the content fields.
 *
 * @param int $post_id Post ID.
 */
function apsc_save_meta( $post_id ) {
	if ( ! isset( $_POST['apsc_meta_nonce'] ) || ! wp_verify_nonce( wp_unslash( $_POST['apsc_meta_nonce'] ), 'apsc_save_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$type = isset( $_POST['post_type'] ) ? sanitize_key( $_POST['post_type'] ) : get_post_type( $post_id );
	$fields = isset( apsc_field_definitions()[ $type ] ) ? apsc_field_definitions()[ $type ] : array();

	foreach ( $fields as $key => $field ) {
		$meta_key = '_apsc_' . $key;

		if ( 'image' === $field['type'] || 'url' === $field['type'] ) {
			$value = isset( $_POST[ $meta_key ] ) ? esc_url_raw( wp_unslash( $_POST[ $meta_key ] ) ) : '';
		} elseif ( 'textarea' === $field['type'] ) {
			$value = isset( $_POST[ $meta_key ] ) ? sanitize_textarea_field( wp_unslash( $_POST[ $meta_key ] ) ) : '';
		} else {
			$value = isset( $_POST[ $meta_key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $meta_key ] ) ) : '';
		}

		if ( 'features' === $key ) {
			$lines = preg_split( '/\r\n|\r|\n/', $value );
			$lines = is_array( $lines ) ? $lines : array( $value );
			$lines = array_values( array_filter( array_map( 'trim', $lines ) ) );
			update_post_meta( $post_id, $meta_key, wp_json_encode( $lines ) );
			continue;
		}

		update_post_meta( $post_id, $meta_key, $value );
	}
}
add_action( 'save_post', 'apsc_save_meta' );

/**
 * Expose the content fields via the REST API so the website can read them.
 */
function apsc_register_rest_fields() {
	$rest_fields = array(
		'ap_testimonial' => array( 'exam', 'rank', 'city', 'rating', 'photo' ),
		'ap_faq'         => array( 'category' ),
		'ap_course'      => array( 'url', 'tagline', 'tag', 'type', 'image', 'features' ),
		'ap_hero'        => array( 'highlight', 'subtitle' ),
		'ap_coupon'      => array( 'type', 'value', 'label', 'active' ),
	);

	foreach ( $rest_fields as $type => $keys ) {
		$properties = array();
		foreach ( $keys as $key ) {
			$properties[ $key ] = 'features' === $key
				? array(
					'type'  => 'array',
					'items' => array( 'type' => 'string' ),
				)
				: array( 'type' => 'string' );
		}

		register_rest_field(
			$type,
			'content_fields',
			array(
				'get_callback' => function ( $object ) use ( $keys ) {
					$out = array();
					foreach ( $keys as $key ) {
						$value = get_post_meta( $object['id'], '_apsc_' . $key, true );
						if ( 'features' === $key && $value ) {
							$decoded = json_decode( (string) $value, true );
							$out[ $key ] = is_array( $decoded ) ? $decoded : array();
						} else {
							$out[ $key ] = $value ? $value : '';
						}
					}
					return $out;
				},
				'schema'       => array(
					'type'       => 'object',
					'properties' => $properties,
				),
			)
		);
	}
}
add_action( 'rest_api_init', 'apsc_register_rest_fields' );

/**
 * Load scripts/styles on our post type screens.
 *
 * @param string $hook Current admin page.
 */
function apsc_admin_assets( $hook ) {
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( ! $screen || ! array_key_exists( $screen->post_type, apsc_field_definitions() ) ) {
		return;
	}
	wp_enqueue_media();
	wp_enqueue_style( 'apsc-admin', APSC_PLUGIN_URL . 'assets/admin.css', array(), APSC_VERSION );
	wp_enqueue_script( 'apsc-admin', APSC_PLUGIN_URL . 'assets/admin.js', array( 'jquery' ), APSC_VERSION, true );
}
add_action( 'admin_enqueue_scripts', 'apsc_admin_assets' );

/**
 * Add a thumbnail column to the image-based post type lists.
 *
 * @param array<string, string> $columns List columns.
 * @return array<string, string>
 */
function apsc_list_columns( $columns ) {
	$new = array();
	foreach ( $columns as $key => $label ) {
		if ( 'title' === $key ) {
			$new['apsc_image'] = 'Image';
		}
		$new[ $key ] = $label;
	}
	return $new;
}
add_filter( 'manage_ap_testimonial_posts_columns', 'apsc_list_columns' );
add_filter( 'manage_ap_course_posts_columns', 'apsc_list_columns' );
add_filter( 'manage_ap_hero_posts_columns', 'apsc_list_columns' );

/**
 * Print the thumbnail column content.
 *
 * @param string $column  Column key.
 * @param int    $post_id Post ID.
 */
function apsc_list_column_content( $column, $post_id ) {
	if ( 'apsc_image' !== $column ) {
		return;
	}
	$photo = get_post_meta( $post_id, '_apsc_photo', true );
	if ( ! $photo ) {
		$photo = get_post_meta( $post_id, '_apsc_image', true );
	}
	if ( $photo ) {
		echo '<img src="' . esc_url( $photo ) . '" alt="" style="width:56px;height:64px;object-fit:cover;border-radius:4px;display:block;" />';
	} else {
		echo '—';
	}
}
add_action( 'manage_ap_testimonial_posts_custom_column', 'apsc_list_column_content', 10, 2 );
add_action( 'manage_ap_course_posts_custom_column', 'apsc_list_column_content', 10, 2 );
add_action( 'manage_ap_hero_posts_custom_column', 'apsc_list_column_content', 10, 2 );

/**
 * ---- Store Settings (delivery charges + discount) ----
 * Configured in wp-admin → "Apni Padhai Store", fetched by the website
 * from /wp-json/apni-padhai/v1/store-settings.
 */

/**
 * Register the store settings menu page.
 */
function apsc_add_store_menu() {
	add_menu_page(
		'Apni Padhai Store Settings',
		'Apni Padhai Store',
		'manage_options',
		'apni-padhai-store',
		'apsc_render_store_settings_page',
		'dashicons-cart',
		30
	);
}
add_action( 'admin_menu', 'apsc_add_store_menu' );

/**
 * Register the store settings fields.
 */
function apsc_register_store_settings() {
	register_setting(
		'apsc_store',
		'apsc_shipping_amount',
		array(
			'type'              => 'number',
			'default'           => '40',
			'sanitize_callback' => 'apsc_sanitize_amount',
		)
	);
	register_setting(
		'apsc_store',
		'apsc_shipping_label',
		array(
			'type'              => 'string',
			'default'           => 'Delivery Charges',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);
	register_setting(
		'apsc_store',
		'apsc_discount_enabled',
		array(
			'type'              => 'boolean',
			'default'           => '0',
			'sanitize_callback' => 'apsc_sanitize_checked',
		)
	);
	register_setting(
		'apsc_store',
		'apsc_discount_type',
		array(
			'type'              => 'string',
			'default'           => 'percent',
			'sanitize_callback' => 'apsc_sanitize_discount_type',
		)
	);
	register_setting(
		'apsc_store',
		'apsc_discount_value',
		array(
			'type'              => 'number',
			'default'           => '0',
			'sanitize_callback' => 'apsc_sanitize_amount',
		)
	);
	register_setting(
		'apsc_store',
		'apsc_discount_label',
		array(
			'type'              => 'string',
			'default'           => 'Discount',
			'sanitize_callback' => 'sanitize_text_field',
		)
	);

	add_settings_section( 'apsc_shipping_section', 'Delivery Charges', '__return_false', 'apsc_store' );
	add_settings_section( 'apsc_discount_section', 'Discount', '__return_false', 'apsc_store' );

	add_settings_field( 'apsc_shipping_amount', 'Shipping amount (₹)', 'apsc_field_shipping_amount', 'apsc_store', 'apsc_shipping_section' );
	add_settings_field( 'apsc_shipping_label', 'Shipping label', 'apsc_field_shipping_label', 'apsc_store', 'apsc_shipping_section' );
	add_settings_field( 'apsc_discount_enabled', 'Enable discount', 'apsc_field_discount_enabled', 'apsc_store', 'apsc_discount_section' );
	add_settings_field( 'apsc_discount_type', 'Discount type', 'apsc_field_discount_type', 'apsc_store', 'apsc_discount_section' );
	add_settings_field( 'apsc_discount_value', 'Discount value', 'apsc_field_discount_value', 'apsc_store', 'apsc_discount_section' );
	add_settings_field( 'apsc_discount_label', 'Discount label', 'apsc_field_discount_label', 'apsc_store', 'apsc_discount_section' );
}
add_action( 'admin_init', 'apsc_register_store_settings' );

/**
 * Sanitize a non-negative amount.
 *
 * @param mixed $value Raw value.
 * @return string
 */
function apsc_sanitize_amount( $value ) {
	$amount = (float) $value;
	if ( $amount < 0 ) {
		$amount = 0;
	}
	return (string) round( $amount, 2 );
}

/**
 * Sanitize a checkbox value.
 *
 * @param mixed $value Raw value.
 * @return string '1' or '0'.
 */
function apsc_sanitize_checked( $value ) {
	return ( '1' === $value || 'on' === $value || true === $value ) ? '1' : '0';
}

/**
 * Sanitize the discount type.
 *
 * @param mixed $value Raw value.
 * @return string
 */
function apsc_sanitize_discount_type( $value ) {
	return in_array( $value, array( 'flat', 'percent' ), true ) ? $value : 'percent';
}

/**
 * Render the store settings page.
 */
function apsc_render_store_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1>Apni Padhai Store Settings</h1>
		<p>These values are fetched by the Apni Padhai website and applied automatically at checkout.</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'apsc_store' ); ?>
			<?php do_settings_sections( 'apsc_store' ); ?>
			<?php submit_button( 'Save Store Settings' ); ?>
		</form>
	</div>
	<?php
}

/**
 * Render the shipping amount field.
 */
function apsc_field_shipping_amount() {
	$value = get_option( 'apsc_shipping_amount', '40' );
	echo '<input type="number" min="0" step="0.01" name="apsc_shipping_amount" value="' . esc_attr( $value ) . '" class="small-text" /> ₹';
	echo '<p class="description">Charged on every order. Set 0 for free delivery.</p>';
}

/**
 * Render the shipping label field.
 */
function apsc_field_shipping_label() {
	$value = get_option( 'apsc_shipping_label', 'Delivery Charges' );
	echo '<input type="text" name="apsc_shipping_label" value="' . esc_attr( $value ) . '" class="regular-text" />';
	echo '<p class="description">The name shown next to the shipping charge on the checkout page.</p>';
}

/**
 * Render the discount enabled checkbox.
 */
function apsc_field_discount_enabled() {
	$checked = '1' === get_option( 'apsc_discount_enabled', '0' ) ? 'checked="checked"' : '';
	echo '<input type="hidden" name="apsc_discount_enabled" value="0" />';
	echo '<label><input type="checkbox" name="apsc_discount_enabled" value="1" ' . $checked . ' /> Apply this discount to every order on the website</label>';
}

/**
 * Render the discount type field.
 */
function apsc_field_discount_type() {
	$type = get_option( 'apsc_discount_type', 'percent' );
	echo '<select name="apsc_discount_type">';
	echo '<option value="percent"' . selected( $type, 'percent', false ) . '>Percentage (%)</option>';
	echo '<option value="flat"' . selected( $type, 'flat', false ) . '>Flat amount (₹)</option>';
	echo '</select>';
}

/**
 * Render the discount value field.
 */
function apsc_field_discount_value() {
	$value = get_option( 'apsc_discount_value', '0' );
	echo '<input type="number" min="0" step="0.01" name="apsc_discount_value" value="' . esc_attr( $value ) . '" class="small-text" />';
	echo '<p class="description">Percentage: enter 10 for 10% off. Flat: enter the rupee amount off.</p>';
}

/**
 * Render the discount label field.
 */
function apsc_field_discount_label() {
	$value = get_option( 'apsc_discount_label', 'Discount' );
	echo '<input type="text" name="apsc_discount_label" value="' . esc_attr( $value ) . '" class="regular-text" />';
	echo '<p class="description">The name shown for the discount on the checkout page.</p>';
}

/**
 * Expose the store settings over REST for the website.
 */
function apsc_register_store_route() {
	register_rest_route(
		'apni-padhai/v1',
		'/store-settings',
		array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'apsc_store_settings_rest',
			'permission_callback' => '__return_true',
		)
	);
}
add_action( 'rest_api_init', 'apsc_register_store_route' );

/**
 * Store settings REST response.
 *
 * @return array<string, array<string, mixed>>
 */
function apsc_store_settings_rest() {
	return array(
		'shipping' => array(
			'amount' => (float) get_option( 'apsc_shipping_amount', '40' ),
			'label'  => get_option( 'apsc_shipping_label', 'Delivery Charges' ),
		),
		'discount' => array(
			'enabled' => '1' === get_option( 'apsc_discount_enabled', '0' ),
			'type'    => get_option( 'apsc_discount_type', 'percent' ),
			'value'   => (float) get_option( 'apsc_discount_value', '0' ),
			'label'   => get_option( 'apsc_discount_label', 'Discount' ),
		),
	);
}
