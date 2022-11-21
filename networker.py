import subprocess

def config_softap(ssid:str, passw:str):
    subprocess.run(f'cmd /C netsh wlan set hostednetwork mode=allow "ssid={ssid}" "key={passw}"',check=True,)

def start_ap():
    subprocess.run('netsh wlan start hostednetwork', check=True)

def stop_ap():
    subprocess.run('netsh wlan stop hostednetwork', check=True)

ip_mac_dic = dict()

def get_mac(ipaddr:str)->str:
    global ip_mac_dic
    if ipaddr in ip_mac_dic:
        return ip_mac_dic[ipaddr]
    
    # update cache
    output = subprocess.check_output('arp -a',encoding='ascii').strip()
    table = [line.split() for line in output.splitlines()]
    ip_mac_dic = {ip:mac for ip,mac,*_ in filter(lambda x:not x[0].isalpha(),table)}
    return ip_mac_dic[ipaddr]