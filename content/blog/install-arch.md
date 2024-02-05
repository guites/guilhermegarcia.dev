+++
title = "Instalando arch em um pc antigo"
date = "2024-02-04T12:47:34-03:00"
description = ""
tags = ['linux', 'português']
slug = 'setting-up-the-white-archie'
draft = true
+++

These are my notes for memory aid and overcomming gotchas while following  <https://wiki.archlinux.org/title/Installation_guide>.

## Arch Linux Installation

1. Download the image via torrent: <https://archlinux.org/download/>
2. Flash to USB using the ISO as is: <https://wiki.archlinux.org/title/USB_flash_installation_medium#Using_macOS_dd>
3. Boot the live environment from the USB
    
    - Inserted the pendrive, booted the PC and used F12 to select the pendrive as the boot device.
    - At this step the screen went black after selecting "Arch Linux Install medium"
    - Added **nomodeset** to the kernel parameter, as pointed out by <https://unix.stackexchange.com/a/727978>. This is done, on the arch linux boot loader menu, by pressing <TAB> and writing `nomodeset`, then pressing enter.
4. Set the console keyboard layout and font

    - `loadkeys br-abnt2`
5. Verify the boot mode

    - the `/sys/firmware/efi/fw_platform_size` file does not exist, indicating that the system booted in BIOS (as expected).
6. Connecting to the internet

    - used `ip link` and verified that my wlan0 adapter is listed
    - used `iwctl` to connect to wifi
7. Update the system clock

    - used `timedatectl set-timezone America/Sao_Paulo`
8. Partition the disks

    - I didn't have to to anything as my disk was already layed out as

            /dev/sda1 2G --> Linux swap
            /dev/sda2 976M --> Extended
            /dev/sda3 295G --> Linux
            /dev/sda5 976M --> Linux swap

        and I'm going to install arch in sda3.
9. Formatting the partitions

    - used `mkfs.ext4 /dev/sda3` and `mkswap /dev/sda1`.
10. Mounting the file systems

    - used `mount /dev/sda3` and `swapon /dev/sda1`.
11. Install the base package, Linux kernel and firmware

    - used `pacstrap -K /mnt base linux linux-firmware`.
    - noticed my download speed was too slow (~200KiB/s)
    - CtrlˆC to stop the current process (it will resume where stopped later on)
    - ran `cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.backup`
    - ran `reflector --verbose --latest 5 --sort rate --save /etc/pacman.d/mirrorlist`
    - retry the downloads with `pacstrap -K /mnt base linux linux-firmware` with speeds closer to 2Mib/s
12. Install vim with `packmang -S vim`.
13. Generated an fstab file
14. Changed root to the new system
15. Set the timezone
16. Set the localization

    - Uncommented `en_US.UTF-8 UTF-8` and `pt_BR.UTF-8 UTF-8` lines
    - ran `locale-gen`
    - created `/etc/locale.conf` with `LANG=en_US.UTF-8`.
    - persist keyboard layout bycreating `/etc/vconsole.conf` with `KEYMAP=br-abnt2`
17. Set the hostname with `echo whitearchie > /etc/hostname`
18. Set the hostname in the /etc/hosts file

        127.0.0.1 localhost
        ::1       localhost
        127.0.0.1 whitearchie.localdomain whitearchie
19. Complete the networkconfiguration by installing `NetworkManager` with `pacman -S networkmanager` and `systemctl enable NetworkManager`.
20. Set the root password with `passwd`.
21. Configure the bootloader (assuming we are a non UEFI install, or MBR:

    - run `pacman -S grub`
    - run `grub-install --target=i386-pc /dev/sda`

        > where i386-pc is deliberately used regardless of your actual architecture, and /dev/sdX is the disk (not a partition) where GRUB is to be installed. For example /dev/sda or /dev/nvme0n1, or /dev/mmcblk0
    - generate the grub configuration file with `grub-mkconfig -o /boot/grub/grub.cfg`.
22. Reboot the machine by

    - exiting the chroot environment with `exit`
    - unmounting all the partitions with `umount -R /mnt`
    - reboot with `reboot`
    - remove the pendrive and turn computer on
    - login with previously created root password
23. Initial config is done!

Additional sources:

- <https://www.arcolinuxd.com/5-the-actual-installation-of-arch-linux-phase-1-uefi/>
- <https://wiki.archlinux.org/title/GRUB#Master_Boot_Record_(MBR)_specific_instructions>

## Setting up the environment

These are necessary house keeping tasks in order to run arch with an internet connection, graphical interface and non privileged user accounts.

### Parallel downloads for pacman

We'll start by **enabling parallel downloads** with pacman. Edit the `/etc/pacman.conf` file and search for `ParallelDownloads` under `[options]`. To enable it, remove the comment (`#`) from the beginning of the line.

I've left the default value of 5.

### Setting the internet connection back

You will notice that after the first reboot, you won't be able to access `iwctl`, and won't have a connection.

Since we installed `networkmanager`,  we have the `nmcli` utility installed.

Start by making sure the `NetworkManager.service` is started and enabled:

```
systemctl status NetworkManager
# if not running
systemctl start NetworkManager
# if not enabled
systemctl enable NetworkManager
```

If you're not sure that network manager is the only network package you've installed, you can check by running:

```
systemctl --type=service
```

and stopping any other network related service in order to avoid conflicts.

List existing wifi networks with `nmclidevice wifi list` and connect to your desired network with `nmcli device wifi connect SSDID password my_new_password`.

### System time synchronization via NTP

Check the current time settings with `timedatectl status`.

If **System clock synchronized** show **no**, activate it with

```
timedatectl set-ntp true
```

### Setting up the GUI with XMonad

Turns out I love tilling window managers. They automatically allocate new windows by dividing existing screen space between applications.

You can also switch between different workspaces, each with its set of apps.

I'll be using [XMonad](https://xmonad.org/) as it looks just great and promises great performance for low end machines.

```
pacman -S xmonad
```
