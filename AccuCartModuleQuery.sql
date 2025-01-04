SELECT TOP (1000) [id]
      ,[column]
      ,[is_taken]
      ,[rack_capacity_id]
      ,[rid]
  FROM [AccuCart].[dbo].[Rack_sensor_state]
  where rack_capacity_id in  (1014, 1015)
  -- Optional Open/Close
  -- AND is_taken = 1; -- Open Slots
  -- AND is_taken = 0; -- Occupied Slots
  -- AND IsNull(rid, NULL) = rid; -- Occupied Slots by RID presence
