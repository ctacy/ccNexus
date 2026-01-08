package storage

import "time"

type Endpoint struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	APIUrl      string    `json:"apiUrl"`
	APIKey      string    `json:"apiKey"`
	Enabled     bool      `json:"enabled"`
	Transformer string    `json:"transformer"`
	Model       string    `json:"model"`
	Remark      string    `json:"remark"`
	SortOrder   int       `json:"sortOrder"`
	Priority    int       `json:"priority"` // 1-10, 1 is highest priority, default 5
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// EndpointBlacklist represents blacklist status for an endpoint
type EndpointBlacklist struct {
	ID                  int64      `json:"id"`
	EndpointName        string     `json:"endpointName"`
	ConsecutiveFailures int        `json:"consecutiveFailures"`
	BlacklistedAt       *time.Time `json:"blacklistedAt"`
	ExpiresAt           *time.Time `json:"expiresAt"`
	CreatedAt           time.Time  `json:"createdAt"`
	UpdatedAt           time.Time  `json:"updatedAt"`
}

type DailyStat struct {
	ID           int64
	EndpointName string
	Date         string
	Requests     int
	Errors       int
	InputTokens  int
	OutputTokens int
	DeviceID     string
	CreatedAt    time.Time
}

type EndpointStats struct {
	Requests     int
	Errors       int
	InputTokens  int64
	OutputTokens int64
}

type Storage interface {
	// Endpoints
	GetEndpoints() ([]Endpoint, error)
	SaveEndpoint(ep *Endpoint) error
	UpdateEndpoint(ep *Endpoint) error
	DeleteEndpoint(name string) error

	// Stats
	RecordDailyStat(stat *DailyStat) error
	GetDailyStats(endpointName, startDate, endDate string) ([]DailyStat, error)
	GetAllStats() (map[string][]DailyStat, error)
	GetTotalStats() (int, map[string]*EndpointStats, error)
	GetEndpointTotalStats(endpointName string) (*EndpointStats, error)

	// Config
	GetConfig(key string) (string, error)
	SetConfig(key, value string) error

	// Blacklist
	RecordEndpointFailure(endpointName string, threshold int, durationMinutes int) (bool, error)
	RecordEndpointSuccess(endpointName string) error
	IsEndpointBlacklisted(endpointName string) (bool, error)
	GetBlacklistedEndpoints() ([]EndpointBlacklist, error)
	RemoveFromBlacklist(endpointName string) error
	CleanExpiredBlacklist() error

	// Close
	Close() error
}
