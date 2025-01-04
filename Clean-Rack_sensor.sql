DELETE FROM AccuCart.dbo.Rack_sensor
WHERE id>0;
SELECT TOP (1000) [id]
      ,[column]
      ,[is_taken]
      ,[timestamp]
      ,[rack_capacity_id]
      ,[feeder_id]
  FROM [AccuCart].[dbo].[Rack_sensor]
