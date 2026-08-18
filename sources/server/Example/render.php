<?php

declare(strict_types=1);

/**
 * Render callback of the {{PLUGIN_SLUG}}/example block.
 *
 * @var array<string, mixed> $attributes
 */

$label = (string) ($attributes['label'] ?? __('Count', '{{TEXT_DOMAIN}}'));
$start = (int) ($attributes['start'] ?? 0);
?>
<div
    <?= wp_kses_data(get_block_wrapper_attributes()) ?>
    data-wp-interactive="{{PLUGIN_SLUG}}"
    <?= wp_kses_data(wp_interactivity_data_wp_context(['count' => $start])) ?>
>
    <p class="{{PLUGIN_SLUG}}-example__label">
        <span><?= esc_html($label) ?>:</span>
        <span class="{{PLUGIN_SLUG}}-example__value" data-wp-text="context.count"></span>
    </p>
    <button
        class="{{PLUGIN_SLUG}}-example__button"
        type="button"
        data-wp-on--click="actions.increment"
    >
        <?php esc_html_e('Increment', '{{TEXT_DOMAIN}}') ?>
    </button>
</div>
