<?php

/**
 * Save hotspot data in database.
 * @param int $fid File id
 * @param string $data Information about hotspots (JSON)
 */
function image_hotspots_db_save($fid, $data) {
  if (empty($data)) {
    return;
  }
  $fields = array('fid' => $fid, 'coordinates' => $data);
  drupal_write_record('image_hotspot', $fields);
}

/**
 * Update hotspot data in database.
 * @param int $fid File id
 * @param string $data Information about hotspots (JSON)
 */
function image_hotspots_db_update($fid, $data) {
  if (empty($data)) {
    return;
  }
  $fields = array('fid' => $fid, 'coordinates' => $data);
  drupal_write_record('image_hotspot', $fields, 'fid');
}

/**
 * Delete hotspot data from database.
 * @param int $fid File id
 */
function image_hotspots_db_delete($fid) {
  db_delete('image_hotspot')
    ->condition('fid', $fid)
    ->execute();
}

/**
 * Get hotspot data from database.
 * @param array $fids Array of files id
 */
function image_hotspots_db_get_coordinates($fids) {
  $query = db_select('image_hotspot', 'image_hotspot');
  $query->fields('image_hotspot', array('coordinates', 'fid'));
  $or = db_or();

  foreach ($fids as $fid) {
    $or->condition('image_hotspot.fid', $fid);
  }

  $query->condition($or);
  $data = $query->execute()->fetchAll();

  return $data;
}
