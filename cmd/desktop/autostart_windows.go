//go:build windows

package main

import (
	"os"
	"path/filepath"

	"golang.org/x/sys/windows/registry"
)

const autostartRegKey = `Software\Microsoft\Windows\CurrentVersion\Run`
const appName = "ccNexus"

// GetAutostart returns whether the app is set to start on boot
func (a *App) GetAutostart() bool {
	key, err := registry.OpenKey(registry.CURRENT_USER, autostartRegKey, registry.QUERY_VALUE)
	if err != nil {
		return false
	}
	defer key.Close()

	_, _, err = key.GetStringValue(appName)
	return err == nil
}

// SetAutostart enables or disables autostart on boot
func (a *App) SetAutostart(enabled bool) error {
	if enabled {
		return enableAutostart()
	}
	return disableAutostart()
}

func enableAutostart() error {
	exePath, err := os.Executable()
	if err != nil {
		return err
	}
	exePath, err = filepath.Abs(exePath)
	if err != nil {
		return err
	}

	key, _, err := registry.CreateKey(registry.CURRENT_USER, autostartRegKey, registry.SET_VALUE)
	if err != nil {
		return err
	}
	defer key.Close()

	return key.SetStringValue(appName, exePath)
}

func disableAutostart() error {
	key, err := registry.OpenKey(registry.CURRENT_USER, autostartRegKey, registry.SET_VALUE)
	if err != nil {
		return nil // Key doesn't exist, already disabled
	}
	defer key.Close()

	err = key.DeleteValue(appName)
	if err == registry.ErrNotExist {
		return nil
	}
	return err
}
