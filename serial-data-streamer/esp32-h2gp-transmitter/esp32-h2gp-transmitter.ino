#include <dummy.h>

#include <Wire.h>
#include <esp_now.h>
#include <WiFi.h>
#include <FastLED.h>
#include <INA226_WE.h>   


INA226_WE ina226_fc = INA226_WE(0x44);
INA226_WE ina226_batt = INA226_WE(0x41);

// Input/Output Pins //
#define solenoidRelayPin 7
#define fuelCellRelayPin 21
//#define B_V 1
//#define FC_V 2
#define activity 37
#define fan 4

// PWM configuration
const int fanPwmChannel = 0;  // PWM channel for the fan (0-15 on ESP32)
const int fanPwmFrequency = 1000;  // Frequency in Hz (25 kHz is a good choice for fans)
const int fanPwmResolution = 8;  // Resolution in bits (8 bits for 0-255 duty cycle range)

// Intervaled logic variables //
// Solenoid
unsigned int purgeInterval = 1000 * 60;
unsigned int purgeDuration = 100;
unsigned int lastPurge = 0;
bool purging = false;
// Fuel Cell
unsigned int shortInterval = 1000 * 60;
unsigned int shortDuration = 100;
unsigned int lastShort = 0;
bool shorting = false;
// Current/Voltage Sens Averaging
unsigned int sensInterval = 1000;
unsigned int lastSens = 0;
unsigned int sensCount = 0;


// Sensor Readings //
float battVoltage = 0;
float fuelVoltage_one = 0;
float fuelVoltage_two = 0;
float battCurrent = 0;
float fcCurrent = 0;
// Averaging Sensor Readings //
float avg_battVoltage = 0;
float avg_battCurrent = 0;
float avg_fcVoltage = 0;
float avg_fcCurrent = 0;


// ESP-NOW //

// ESP-NOW Communication Channel 0-14
#define CHANNEL 1;

// Variable to have a key in the receive callback
unsigned int key = 1892283;

// Variables to slow sending the data
// when the last data was sent to the pits
unsigned long previousMillis = -9999;
// how often to send the data to the pits
const long interval = 1000;

// Mac address for peer, 0xFF all for universal peer, as long as channel matches
uint8_t receiverMac[] = {0x40, 0x22, 0xD8, 0x05, 0x59, 0x40};

// add peer (receiver ESP32)
esp_now_peer_info_t peerInfo;

// structure to store variables
typedef struct variables {
  unsigned int purgeInterval;
  unsigned int purgeDuration;
  unsigned int shortInterval;
  unsigned int shortDuration;
  float battVoltage;
  float fuelVoltage_one;
  float fuelVoltage_two;
  float battCurrent;
  float fcCurrent;
  unsigned int key;
};

// create global variable of type variables
variables myData;
variables receivedData;

// Send Callback function, called when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Pack Send Status: \t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
  Serial.println("Data Sent: ");
  Serial.print("Voltages: ");
  Serial.print(myData.battVoltage);
  Serial.print("  Fuel Cell One: ");
  Serial.print(myData.fuelVoltage_one);
  Serial.print("  Fuel Cell Two: ");
  Serial.println(myData.fuelVoltage_two);
  Serial.print("Battery Current: ");
  Serial.print(myData.battCurrent);
  Serial.print("  Fuel Cell Current: ");
  Serial.println(myData.fcCurrent);
  Serial.println("");
}

// Callback for data received
void OnDataRecv(const uint8_t *mac_addr, const uint8_t *data, int len) {
    // Copy only the key portion of the received data
    unsigned int receivedKey;
    memcpy(&receivedKey, data + offsetof(variables, key), sizeof(receivedKey));

    // Check if the key is correct
    if (receivedKey == 1892283) {
    // copy received data to global variable
    memcpy(&receivedData, data, sizeof(receivedData));
    Serial.print("Data Received: ");
    Serial.println(len);
    Serial.print("Purge Interval: ");
    Serial.print(receivedData.purgeInterval);
    Serial.print("  Purge Duration: ");
    Serial.println(receivedData.purgeDuration);
    Serial.print("Short Interval: ");
    Serial.print(receivedData.shortInterval);
    Serial.print("  Short Duration: ");
    Serial.println(receivedData.shortDuration);
    Serial.println("");
  
    //Update local values with the received values
    purgeInterval = receivedData.purgeInterval;
    purgeDuration = receivedData.purgeDuration;
    shortInterval = receivedData.shortInterval;
    shortDuration = receivedData.shortDuration;
  } else {
    Serial.println("Incorrect Key");
  }
}

void setup() {
  // Initialize Serial Monitor
  delay(5000);
  Serial.begin(115200);
  delay(100);
  Serial.println("Serial Initialized");
  delay(100);

  //Initialize INA226's
  Wire.begin();
  delay(100);

  Serial.println("Initializing INA226's");
  
  ina226_fc.init();
  ina226_fc.setAverage(AVERAGE_1);
  ina226_fc.setConversionTime(CONV_TIME_8244);
  ina226_fc.setResistorRange(0.005, 16.38);
  ina226_fc.setCorrectionFactor(0.93);
  ina226_fc.waitUntilConversionCompleted();
  ina226_fc.setAlertType(BUS_OVER,9999);  // disable alert latching
  Serial.println("Fuel Cell Ina226 Initialized");

  ina226_batt.init();
  ina226_batt.setAverage(AVERAGE_1); 
  ina226_batt.setConversionTime(CONV_TIME_8244);
  ina226_batt.setResistorRange(0.003, 27.31);
  ina226_batt.setCorrectionFactor(0.93);
  ina226_batt.waitUntilConversionCompleted();
  ina226_batt.setAlertType(BUS_OVER,9999);  // disable alert latching
  Serial.println("Battery Ina226 Initialized");

  // Set pins Modes to OUTPUT, pins are defined at top of document
  pinMode(solenoidRelayPin, OUTPUT);
  pinMode(fuelCellRelayPin, OUTPUT);
  pinMode(activity, OUTPUT);

  // PWM setup for fan
  ledcSetup(fanPwmChannel, fanPwmFrequency, fanPwmResolution);
  ledcAttachPin(fan, fanPwmChannel);

  // Set initial fan speed (0-255)
  int initialFanSpeed = 200;  
  ledcWrite(fanPwmChannel, initialFanSpeed);

  // Set ESP32 as a Wifi Station
  WiFi.mode(WIFI_STA);
  
  // Initialize ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Register the callback function
  esp_now_register_send_cb(OnDataSent);

  // Register callback function
  esp_now_register_recv_cb(OnDataRecv);

  // Register Peer
  memcpy(peerInfo.peer_addr, receiverMac, 6);
  peerInfo.channel = CHANNEL;
  peerInfo.encrypt = false;

  // Add Peer
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
  // update struct variable "key" with local key value
  myData.key = key;
}

void loop() {
  // Basic fuel cell controller logic
  setPurge();
  setShort();

  // Current & Voltage Sensing // ina226_batt  ina226_fc
  // battery
  ina226_batt.readAndClearFlags();
  
  // fuel cell
  ina226_fc.readAndClearFlags();

  //average values on the sensInterval
  averageSens();

  if (millis() - previousMillis >= interval) {
    // save the current time
    previousMillis = millis();
    // put your code here that you want to run every (interval)
    esp_err_t sentData = esp_now_send(receiverMac, (uint8_t *) &myData, sizeof(myData));
    // check if data was sent properly    
    if (sentData == ESP_OK) {
      Serial.println("Sending confirmed");
    } else {
      Serial.println("Sending error");
    }
  }
}

void setShort() {
  if (lastShort + shortInterval < millis()) {
    lastShort = millis();
  }
  if (lastShort + shortDuration > millis()) {
    digitalWrite(fuelCellRelayPin, HIGH);
    shorting = true;
    Serial.println("Shorting");
  } else {
    digitalWrite(fuelCellRelayPin, LOW);
    shorting = false;
  }
}

void averageSens() {
  // progress averaging adding new values & getting count of how many were added
  if (lastSens + sensInterval > millis()) {
    sensCount++;
    //Serial.println("Averaging");
    avg_battVoltage += ina226_batt.getBusVoltage_V();
    avg_battCurrent += ina226_batt.getCurrent_mA()/1000*(-1);
    avg_fcVoltage += ina226_fc.getBusVoltage_V();
    avg_fcCurrent += ina226_fc.getCurrent_mA()/1000*(-1);
  } else {
    //save average
    myData.battCurrent = avg_battCurrent / sensCount;
    myData.battVoltage = avg_battVoltage / sensCount;
    myData.fcCurrent = avg_fcCurrent / sensCount;
    myData.fuelVoltage_one = avg_fcVoltage / sensCount;
    myData.fuelVoltage_two = avg_fcVoltage / sensCount;
    //reset count and averaging values
    sensCount = 0;
    avg_battVoltage = 0;
    avg_battCurrent = 0;
    avg_fcVoltage = 0;
    avg_fcCurrent = 0;
    //set last sense time
    lastSens = millis();
  }
}

void setPurge() {
  if (lastPurge + purgeInterval < millis()) {
    lastPurge = millis();
  }
  if (lastPurge + purgeDuration > millis()) {
    digitalWrite(solenoidRelayPin, HIGH);
    purging = true;
    Serial.println("Purging");
  } else {
    digitalWrite(solenoidRelayPin, LOW);
    purging = false;
  }
}
