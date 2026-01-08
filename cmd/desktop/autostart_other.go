//go:build !windows

package main

// GetAutostart returns whether the app is set to start on boot
// Not implemented for non-Windows platforms
func (a *App) GetAutostart() bool {
	return false
}

// SetAutostart enables or disables autostart on boot
// Not implemented for non-Windows platforms
func (a *App) SetAutostart(enabled bool) error {
	return nil
}
