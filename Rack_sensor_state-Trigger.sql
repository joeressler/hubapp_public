USE [AccuCart]
GO
/****** Object:  Trigger [dbo].[rack_sensor_monitor]    Script Date: 12/22/2024 9:31:59 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER trigger [dbo].[rack_sensor_monitor] on [dbo].[Rack_sensor_state]
AFTER UPDATE
AS
BEGIN
	declare @sensor_status bit=0
	declare @sensor_status_b4 bit=0
	declare @slot int = 0
	declare @capacity_id int = 0
	if update (is_taken)
	begin
		select @slot = inserted.[column], @capacity_id=inserted.rack_capacity_id, @sensor_status = inserted.is_taken from inserted
		select @sensor_status_b4 = deleted.is_taken from deleted
		if (@sensor_status <> @sensor_status_b4 AND NOT EXISTS (select * from Rack_LED where rack_capacity_id = @capacity_id and [column]=@slot and (red>0 or green>0 or blue>0) ))
		begin
			if @sensor_status = 0      /*** Reel inserted into Slot. Flash red  ***/
			begin
				if EXISTS (select * from Rack_LED where rack_capacity_id = @capacity_id and [column]=@slot)
				begin
					update Rack_led set red=255,green=0,blue=0,is_flicker=1 where rack_capacity_id=@capacity_id and [column]=@slot
				end
				else
				begin
					insert into Rack_LED ([column],red,green,blue,is_flicker,is_log,rack_capacity_id) values (@Slot,255,0,0,1,0,@capacity_id)
				end
			end
			else                      /*** Reel removed from slot. Flash yellow  ***/
			begin
				if EXISTS (select * from Rack_LED where rack_capacity_id = @capacity_id and [column]=@slot)
				begin
					update Rack_led set red=255, green=85,blue=0,is_flicker=1 where rack_capacity_id=@capacity_id and [column]=@slot
				end
				else
			    begin
				insert into Rack_LED ([column],red,green,blue,is_flicker,is_log,rack_capacity_id) values (@Slot,255,85,0,1,0,@capacity_id)
			    end
			end
		end
	end
END
