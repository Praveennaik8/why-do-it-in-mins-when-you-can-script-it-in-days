import pyautogui
import time
from datetime import datetime
import sys
import os

def main():
    pyautogui.FAILSAFE = False
    start = time.time()
    now = datetime.now()
    current_time = now.strftime("%H:%M:%S")
    print("Script started at: "+str(current_time))
    try:
        while True:
            time.sleep(50)
            for i in range(100):
                pyautogui.moveTo(0,i*5)
        
            for i in range(0,3):
                pyautogui.press('shift')

    except KeyboardInterrupt:
        end = time.time()
        now = datetime.now()
        current_time = now.strftime("%H:%M:%S")
        print("Script ended at: "+str(current_time))
        print("Total time : "+str((end-start)/60))
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)

if __name__ == '__main__':
    main()
